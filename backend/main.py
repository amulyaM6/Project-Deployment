from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
import os
import io
import json
import time
import uuid
import PyPDF2
import docx
from dotenv import load_dotenv
from rag import build_rag, retrieve_chunks
from datasets import get_sector_context
from risk_engine import compute_risk_score, WEIGHTS
from simulation import simulate_timeline
from monte_carlo import run_monte_carlo
from monte_carlo_api import router as monte_carlo_router
from risk_ensemble import rate_risk_dimensions

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(monte_carlo_router)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _groq_create(retries: int = 3, **kwargs):
    """Wraps client.chat.completions.create with automatic retry on Groq's
    429 (rate limit) response. Groq's free tier caps tokens-per-minute, and
    this app sometimes makes 2 calls back-to-back (classifier + analysis)
    that together can briefly exceed it. Groq's error message includes the
    exact wait time needed, so we back off a little longer than that and
    try again rather than failing the whole upload."""
    last_error = None
    for attempt in range(retries):
        try:
            return client.chat.completions.create(**kwargs)
        except Exception as e:
            msg = str(e)
            if "rate_limit_exceeded" in msg or "429" in msg:
                last_error = e
                time.sleep(1.5 * (attempt + 1))  # 1.5s, 3s, 4.5s backoff
                continue
            raise
    raise last_error

# All 28 Indian states (matches the paper's "all 28 states" claim — this used
# to be a hardcoded example list of 7 states, so most of the map defaulted
# to 0/no-data regardless of the policy).
INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
    "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
    "West Bengal",
]

# ── Extract text from uploaded file ──
def extract_text(file_bytes: bytes, filename: str) -> str:
    if filename.endswith(".pdf"):
        reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        # `or ""` — extract_text() returns None for pages without a text
        # layer (e.g. scanned pages), which used to crash the join.
        return " ".join((page.extract_text() or "") for page in reader.pages)
    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        return " ".join(p.text for p in doc.paragraphs)
    else:
        return file_bytes.decode("utf-8")

# ── Send RAG context to Groq for analysis ──
#
# The four risk dimensions (severity, plausibility, magnitude, vulnerable
# population) are NOT requested here any more. They are rated separately by
# risk_ensemble.rate_risk_dimensions(): three raters use one written rubric,
# must quote evidence from the policy (verified in code), and the median is
# taken. The overall score is then computed in Python by
# risk_engine.compute_risk_score() using a fixed, documented formula.
#
# The timeline is not LLM-invented either — see simulate_timeline() in
# simulation.py, called after this function returns.
#
# NOTE: this prompt is an f-string, so every literal { or } in the JSON
# example below MUST be doubled ({{ and }}). Only real placeholders such as
# {states_list_example} or {policy_text} use single braces.
def analyse_with_groq(policy_text: str) -> dict:
    states_list_example = ",\n    ".join(
        f'{{"state": "{s}", "impact_score": "<0-100>"}}' for s in INDIAN_STATES[:3]
    )

    prompt = f"""
You are a government policy analyst for India.

Analyse this policy document and return ONLY a JSON object with this exact structure, no extra text, no markdown, no backticks:

{{
  "policy_title": "title of the policy",
  "two_stage_scenario": {{
    "stage1_before": "Detailed 2-3 sentence story describing the societal problems and challenges BEFORE this policy is implemented.",
    "stage2_after": "Detailed 2-3 sentence story describing the outcomes, changes, and unintended consequences AFTER this policy is implemented."
  }},
  "sectors": [
    {{"name": "Agriculture", "score": "<0-100>", "sentiment": "<positive|negative|neutral>"}},
    {{"name": "Economy", "score": "<0-100>", "sentiment": "<positive|negative|neutral>"}},
    {{"name": "Healthcare", "score": "<0-100>", "sentiment": "<positive|negative|neutral>"}},
    {{"name": "Education", "score": "<0-100>", "sentiment": "<positive|negative|neutral>"}},
    {{"name": "Infrastructure", "score": "<0-100>", "sentiment": "<positive|negative|neutral>"}}
  ],
  "states": [
    {states_list_example},
    ... one entry for EVERY state listed below ...
  ],
  "stakeholders": [
    {{"group": "Farmers", "impact": "describe impact here", "severity": "high"}},
    {{"group": "Urban Workers", "impact": "describe impact here", "severity": "medium"}},
    {{"group": "State Governments", "impact": "describe impact here", "severity": "high"}},
    {{"group": "Exporters", "impact": "describe impact here", "severity": "low"}}
  ],
  "recommendations": [
    {{
      "title": "Short title of recommendation",
      "description": "2-3 sentence explanation of what change should be made and why",
      "priority": "high",
      "sector": "Economy"
    }},
    {{
      "title": "Short title",
      "description": "2-3 sentence explanation",
      "priority": "medium",
      "sector": "Agriculture"
    }},
    {{
      "title": "Short title",
      "description": "2-3 sentence explanation",
      "priority": "low",
      "sector": "Healthcare"
    }},
    {{
      "title": "Short title",
      "description": "2-3 sentence explanation",
      "priority": "high",
      "sector": "Infrastructure"
    }}
  ]
}}

Score rules:
- Do NOT provide any overall risk score or risk dimensions; the backend computes those separately.
- sector scores: 0 to 100
- sentiment: only "positive", "negative", or "neutral"
- severity (stakeholders): only "high", "medium", or "low"
- priority: only "high", "medium", or "low"
- states: include EVERY one of these {len(INDIAN_STATES)} states, each with an impact_score 0-100 based on the policy's relevance to that state: {", ".join(INDIAN_STATES)}
- Give exactly 4 recommendations based on actual policy weaknesses
- Use the RBI reference data to give accurate state-wise and sector-wise scores where it's relevant; where no real dataset is provided for a sector, rely on the policy text itself and say so implicitly through a more moderate/neutral score rather than guessing confidently

Policy document (relevant excerpts):
{policy_text}
"""

    # 3200 (was 2200): the added two_stage_scenario text makes the JSON
    # longer, and a truncated response fails JSON parsing.
    return _call_groq_json(prompt, max_tokens=3200)


def _call_groq_json(prompt: str, max_tokens: int = 2000, retries: int = 1) -> dict:
    """Call Groq expecting a JSON object back. Retries once with a sharper
    reminder if the first response isn't valid JSON, so a single flaky
    generation doesn't crash the whole request (this matters live, on stage,
    during a demo)."""
    last_error = None
    attempt_prompt = prompt

    for attempt in range(retries + 1):
        response = _groq_create(
            model="openai/gpt-oss-120b",
            temperature=0,
            max_tokens=max_tokens,
            messages=[
                {
                    "role": "system",
                    "content": "You are a policy analyst. Always respond with valid JSON only. No markdown, no backticks, no extra text."
                },
                {
                    "role": "user",
                    "content": attempt_prompt
                }
            ]
        )

        response_text = response.choices[0].message.content.strip()
        if response_text.startswith("```"):
            response_text = response_text.split("```")[1]
            if response_text.startswith("json"):
                response_text = response_text[4:]

        try:
            return json.loads(response_text)
        except json.JSONDecodeError as e:
            last_error = e
            attempt_prompt = (
                prompt
                + "\n\nYour previous response was not valid JSON. "
                  "Return ONLY the JSON object, with no markdown formatting, "
                  "no backticks, and no explanation text before or after it."
            )

    raise ValueError(f"Groq returned invalid JSON after {retries + 1} attempts: {last_error}")


# ── Route: Upload + Analyse ──
@app.post("/upload")
async def upload_policy(file: UploadFile = File(...)):
    try:
        # Check file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
        ]
        if file.content_type not in allowed_types:
            return {"error": "Only PDF, DOCX, or TXT files are allowed"}

        # Check file size (10MB max)
        file_bytes = await file.read()
        if len(file_bytes) > 10 * 1024 * 1024:
            return {"error": "File is too large. Maximum size is 10MB"}

        # Extract text
        text = extract_text(file_bytes, file.filename)

        # Check if text is empty
        if not text or len(text.strip()) < 50:
            return {"error": "Could not extract text from this file. It may be a scanned image or blank document. Please upload a text-based PDF or DOCX."}

        # ── Check if it's actually a government policy ──
        check_response = _groq_create(
            model="openai/gpt-oss-120b",
            max_tokens=10,
            messages=[
                {
                    "role": "system",
                    "content": "You are a document classifier. Reply with only 'yes' or 'no'."
                },
                {
                    "role": "user",
                    "content": f"Is this document a government policy, legislation, bill, scheme, act, or official government document? Reply only yes or no.\n\n{text[:1000]}"
                }
            ]
        )

        is_policy = check_response.choices[0].message.content.strip().lower()

        if 'no' in is_policy:
            return {"error": "This does not appear to be a government policy document. Please upload a policy, bill, act, scheme, or official government document."}

        # ── RAG: chunk, embed, store, retrieve ──
        # Unique collection per upload — prevents any possibility of a
        # previous upload's data bleeding into this one (see rag.py notes)
        collection_id = f"policy_{uuid.uuid4().hex[:12]}"
        build_rag(text, collection_name=collection_id)

        sector_context = retrieve_chunks("sector impact risk economy agriculture healthcare infrastructure education", collection_id)
        state_context = retrieve_chunks("state wise impact india punjab maharashtra kerala uttar pradesh gujarat", collection_id)
        stakeholder_context = retrieve_chunks("stakeholders affected groups people farmers organizations government", collection_id)
        timeline_context = retrieve_chunks("timeline short term long term future impact years months", collection_id)

        # ── Fetch real RBI dataset context ──
        sector_names = ["agriculture", "economy", "infrastructure", "healthcare", "education"]
        dataset_context, data_grounded = get_sector_context(sector_names)

        rag_context = f"""
SECTOR IMPACT CONTEXT (from policy):
{sector_context}

STATE IMPACT CONTEXT (from policy):
{state_context}

STAKEHOLDER CONTEXT (from policy):
{stakeholder_context}

TIMELINE CONTEXT (from policy):
{timeline_context}

REAL INDIA REFERENCE DATA (RBI Handbook of Statistics):
{dataset_context}
"""

        result = analyse_with_groq(rag_context)

        # ── Multi-LLM ensemble rates the four risk dimensions ──
        # Three raters, one written rubric, evidence quotes verified against
        # the full policy text, median per dimension (see risk_ensemble.py).
        ensemble = rate_risk_dimensions(rag_context, text, _groq_create)
        result["risk_dimensions"] = ensemble["risk_dimensions"]
        result["risk_dimension_details"] = ensemble["details"]
        result["risk_confidence"] = ensemble["confidence"]
        result["risk_models_used"] = ensemble["models_used"]

        # ── Compute the overall risk score with the rule-based engine ──
        # (the ensemble supplied the four input dimensions above)
        risk = compute_risk_score(result.get("risk_dimensions", {}))
        result["overall_risk_score"] = risk["overall_risk_score"]
        result["risk_level"] = risk["risk_level"]
        result["risk_dimensions"] = risk["dimensions"]
        result["score_explanation"] = risk["explanation"]

        # ── Mark which sectors are backed by real government data vs
        # AI-estimated only, so the dashboard can show an honest badge ──
        for sector in result.get("sectors", []):
            sector["data_grounded"] = data_grounded.get(sector.get("name", "").lower(), False)

        # ── Timeline: the deterministic stakeholder-adaptation decay model ──
        # (not LLM-generated). Using the same model as the Monte Carlo fan
        # keeps the timeline chart consistent with it.
        result["timeline"] = simulate_timeline(
            result["overall_risk_score"], result.get("stakeholders", [])
        )

        # ── Explainability: exact contribution of each risk dimension ──
        # score = sum(weight x rating), so each term IS that dimension's
        # exact contribution to the overall score (no trained model needed).
        result["risk_contributions"] = {
            k: round(v * WEIGHTS.get(k, 0), 1)
            for k, v in result["risk_dimensions"].items()
        }

        # ── Real Monte Carlo: propagate uncertainty in the risk dimensions,
        # stakeholder adaptability and model structure (see monte_carlo.py) ──
        result["monte_carlo"] = run_monte_carlo(
            result["risk_dimensions"], result.get("stakeholders", [])
        )

        result["id"] = f"sim_{uuid.uuid4().hex[:6]}"
        return result

    except Exception as e:
        return {"error": str(e)}


# ── Route: Health check ──
@app.get("/")
def root():
    return {"status": "Backend is running!"}


# ── Route: Compare Two Policies ──
@app.post("/compare")
async def compare_policies(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...)
):
    try:
        bytes1 = await file1.read()
        bytes2 = await file2.read()
        text1 = extract_text(bytes1, file1.filename)
        text2 = extract_text(bytes2, file2.filename)

        # ── RAG for both policies ──
        collection_id1 = f"policy1_{uuid.uuid4().hex[:12]}"
        collection_id2 = f"policy2_{uuid.uuid4().hex[:12]}"
        build_rag(text1, collection_name=collection_id1)
        build_rag(text2, collection_name=collection_id2)

        context1 = retrieve_chunks("sector economy agriculture healthcare infrastructure impact", collection_id1)
        context2 = retrieve_chunks("sector economy agriculture healthcare infrastructure impact", collection_id2)

        # ── Fetch real RBI dataset context for comparison ──
        dataset_context, _ = get_sector_context(["agriculture", "economy", "infrastructure", "healthcare", "education"])

        prompt = f"""
You are a government policy analyst for India.

Compare these two policy documents and return ONLY a JSON object, no extra text, no backticks:

{{
  "policy1_title": "title of first policy",
  "policy2_title": "title of second policy",
  "common_fields": ["Economy", "Agriculture", "Healthcare", "Education", "Infrastructure"],
  "comparison": {{
    "Economy": {{
      "policy1_score": 70,
      "policy2_score": 45,
      "policy1_summary": "one line about policy 1 economy impact",
      "policy2_summary": "one line about policy 2 economy impact",
      "winner": "policy1"
    }},
    "Agriculture": {{
      "policy1_score": 60,
      "policy2_score": 80,
      "policy1_summary": "one line about policy 1 agriculture impact",
      "policy2_summary": "one line about policy 2 agriculture impact",
      "winner": "policy2"
    }},
    "Healthcare": {{
      "policy1_score": 55,
      "policy2_score": 65,
      "policy1_summary": "one line summary",
      "policy2_summary": "one line summary",
      "winner": "policy2"
    }},
    "Education": {{
      "policy1_score": 75,
      "policy2_score": 50,
      "policy1_summary": "one line summary",
      "policy2_summary": "one line summary",
      "winner": "policy1"
    }},
    "Infrastructure": {{
      "policy1_score": 65,
      "policy2_score": 70,
      "policy1_summary": "one line summary",
      "policy2_summary": "one line summary",
      "winner": "policy2"
    }}
  }},
  "overall_winner": "policy1",
  "overall_winner_reason": "one line explaining why"
}}

Score rules:
- All scores 0 to 100 (higher = better for that sector)
- winner: either "policy1" or "policy2"
- overall_winner: either "policy1" or "policy2"
- Use the RBI reference data to make scores more accurate

Policy 1 (relevant excerpts):
{context1}

Policy 2 (relevant excerpts):
{context2}

REAL INDIA REFERENCE DATA (RBI):
{dataset_context}
"""

        return _call_groq_json(prompt, max_tokens=1500)

    except Exception as e:
        return {"error": str(e)}