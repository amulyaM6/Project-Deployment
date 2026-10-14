"""
risk_ensemble.py
----------------
Rubric-guided, multi-rater estimation of the four risk dimensions
(severity, plausibility, magnitude, vulnerable_population).

How it works
  1. Several raters (model + temperature pairs) each score the four
     dimensions using the SAME written rubric.
  2. Every rating must carry a one-sentence reason and a verbatim quote from
     the policy. The quote is checked against the real policy text in code.
  3. Per dimension, the final score is the MEDIAN of the raters' scores.
  4. The spread between raters gives a confidence label (high/medium/low).

The result is shaped so main.py can pass `risk_dimensions` straight into
compute_risk_score(), exactly as before.

NOTE: all raters here come from one model family (GPT-OSS on Groq), so
agreement between them is a stability measure, NOT proof of correctness.
"""

import json
import re
import statistics
from concurrent.futures import ThreadPoolExecutor

DIMENSIONS = ["severity", "plausibility", "magnitude", "vulnerable_population"]

# (model id on Groq, temperature). Check these IDs exist in your Groq console.
DEFAULT_RATERS = [
    ("openai/gpt-oss-120b", 0.0),
    ("openai/gpt-oss-20b", 0.0),
    ("openai/gpt-oss-120b", 0.6),
]

NO_EVIDENCE = "NO_DIRECT_EVIDENCE"

RUBRIC_PROMPT = """
You are rating the risk of an Indian government policy on four dimensions.
Use ONLY the policy excerpts and reference data below. Each score is an
integer from 0 to 100. Pick the band that best matches, then a number in it.

SEVERITY - how harmful are the negative side-effects IF they occur?
  0-20 negligible and easily reversed | 21-40 minor, affects a small group
  41-60 noticeable but fixable | 61-80 serious for many people
  81-100 severe or hard to reverse

PLAUSIBILITY - how likely are those side-effects to actually happen, given
the policy design and implementation context?
  0-20 very unlikely | 21-40 unlikely | 41-60 possible
  61-80 likely | 81-100 almost certain

MAGNITUDE - how large a share of the population or economy is affected?
Use numbers from the policy (beneficiaries, budget) where they exist.
  0-20 a niche group or under 1% | 21-40 a few percent
  41-60 roughly 5-20% | 61-80 roughly 20-50% | 81-100 more than half

VULNERABLE_POPULATION - how strongly are vulnerable groups (poor, rural,
women, SC/ST, elderly, disabled) exposed to the policy's risks such as
exclusion, loss or hardship?
  0-20 largely unaffected or protected | 21-40 slight exposure
  41-60 moderate exposure | 61-80 high exposure
  81-100 severely exposed or the main target of the risk

RULES
- "reason": ONE sentence explaining the score.
- "evidence": a quote COPIED EXACTLY from the POLICY excerpts (not the
  reference data), at most 25 words. If the policy gives no direct
  evidence, write exactly NO_DIRECT_EVIDENCE and say in "reason" that the
  score is an inference.
- Do not copy example numbers. Rate only from the material below.
- Return ONLY a JSON object, no markdown, no backticks, no extra text.

JSON format:
{
  "severity": {"score": <integer 0-100>, "reason": "<one sentence>", "evidence": "<exact quote or NO_DIRECT_EVIDENCE>"},
  "plausibility": {"score": <integer 0-100>, "reason": "<one sentence>", "evidence": "<exact quote or NO_DIRECT_EVIDENCE>"},
  "magnitude": {"score": <integer 0-100>, "reason": "<one sentence>", "evidence": "<exact quote or NO_DIRECT_EVIDENCE>"},
  "vulnerable_population": {"score": <integer 0-100>, "reason": "<one sentence>", "evidence": "<exact quote or NO_DIRECT_EVIDENCE>"}
}

MATERIAL
<<CONTEXT>>
"""

SYSTEM_MSG = (
    "You are a careful policy risk rater. Respond with valid JSON only. "
    "No markdown, no backticks, no extra text."
)


# ---------------------------------------------------------------- helpers
def _parse_json(text: str) -> dict:
    """Parse JSON from a model reply, tolerating code fences or stray text."""
    text = (text or "").strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise


def _norm_words(s: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    return " ".join(re.sub(r"[^a-z0-9 ]+", " ", (s or "").lower()).split())


def _norm_chars(s: str) -> str:
    """Lowercase letters and digits only (survives broken PDF spacing)."""
    return re.sub(r"[^a-z0-9]", "", (s or "").lower())


def verify_quote(quote: str, source_words: str, source_chars: str):
    """True  = quote found in the policy text
       False = quote NOT found (possible fabrication)
       None  = rater said there was no direct evidence"""
    if not quote or quote.strip().upper() == NO_EVIDENCE:
        return None
    q_words = _norm_words(quote)
    if len(q_words.split()) < 4:
        return False
    if q_words in source_words:
        return True
    if _norm_chars(quote) in source_chars:
        return True
    words = q_words.split()
    shingles = [" ".join(words[i:i + 3]) for i in range(len(words) - 2)]
    if not shingles:
        return False
    hits = sum(1 for s in shingles if s in source_words)
    return (hits / len(shingles)) >= 0.8


def _clamp(x) -> int:
    return max(0, min(100, int(round(float(x)))))


def _call_one_rater(model, temperature, prompt, create_fn, source_words, source_chars):
    """Run one rater. Returns {dimension: {...}} or raises on failure."""
    last_error = None
    attempt_prompt = prompt
    for _ in range(2):  # one retry if the JSON is broken
        resp = create_fn(
            model=model,
            temperature=temperature,
            max_tokens=3000,  # reasoning models spend tokens thinking first
            messages=[
                {"role": "system", "content": SYSTEM_MSG},
                {"role": "user", "content": attempt_prompt},
            ],
        )
        try:
            data = _parse_json(resp.choices[0].message.content)
            ratings = {}
            for dim in DIMENSIONS:
                item = data[dim]
                evidence = str(item.get("evidence", NO_EVIDENCE))
                ratings[dim] = {
                    "model": f"{model}@T{temperature}",
                    "score": _clamp(item["score"]),
                    "reason": str(item.get("reason", "")).strip(),
                    "evidence": evidence,
                    "evidence_verified": verify_quote(evidence, source_words, source_chars),
                }
            return ratings
        except (json.JSONDecodeError, KeyError, TypeError, ValueError) as e:
            last_error = e
            attempt_prompt = prompt + "\n\nYour previous reply was not valid JSON in the required format. Return ONLY the JSON object."
    raise ValueError(f"{model}: invalid output ({last_error})")


_CONF_ORDER = {"low": 0, "medium": 1, "high": 2}


def _dimension_confidence(spread: int, verified_count: int, n_raters: int) -> str:
    if n_raters < 2:
        return "low"
    if spread <= 15 and verified_count >= 2:
        return "high"
    if spread <= 30:
        return "medium"
    return "low"


# ------------------------------------------------------------ main entry
def rate_risk_dimensions(context: str, source_text: str, create_fn, raters=None) -> dict:
    """
    context     : text shown to the raters (policy excerpts + reference data)
    source_text : the FULL policy text, used only to verify quoted evidence
    create_fn   : function(**kwargs) that calls the chat API
                  (pass main.py's _groq_create so rate-limit retries are reused)
    """
    raters = raters or DEFAULT_RATERS
    prompt = RUBRIC_PROMPT.replace("<<CONTEXT>>", context)
    source_words = _norm_words(source_text)
    source_chars = _norm_chars(source_text)

    results, failed = [], []
    with ThreadPoolExecutor(max_workers=len(raters)) as pool:
        futures = [
            (m, t, pool.submit(_call_one_rater, m, t, prompt, create_fn, source_words, source_chars))
            for (m, t) in raters
        ]
        for m, t, fut in futures:
            try:
                results.append(fut.result())
            except Exception as e:  # one rater failing must not kill the run
                failed.append(f"{m}@T{t}: {e}")

    if not results:
        raise ValueError("All risk raters failed: " + " | ".join(failed))

    final_dims, details = {}, {}
    for dim in DIMENSIONS:
        ratings = [r[dim] for r in results]
        scores = [x["score"] for x in ratings]
        median = _clamp(statistics.median(scores))
        spread = max(scores) - min(scores)
        verified = sum(1 for x in ratings if x["evidence_verified"] is True)
        final_dims[dim] = median
        details[dim] = {
            "score": median,
            "spread": spread,
            "evidence_verified_count": verified,
            "confidence": _dimension_confidence(spread, verified, len(ratings)),
            "ratings": ratings,
        }

    overall_conf = min((d["confidence"] for d in details.values()), key=lambda c: _CONF_ORDER[c])
    return {
        "risk_dimensions": final_dims,
        "details": details,
        "confidence": overall_conf,
        "models_used": [r[DIMENSIONS[0]]["model"] for r in results],
        "models_failed": failed,
    }