"""
Rule-based risk scoring engine.

This replaces "ask the LLM to invent a final risk number" with a fixed,
documented formula applied in code. The LLM's job is reduced to estimating
the four input dimensions from the policy text; the score itself is always
computed the same way, so it's reproducible and explainable.

Dimensions (each 0-100, estimated by the LLM from the policy text):
  - severity:              how bad are the negative side-effects if they occur?
  - plausibility:          how likely are those effects to actually happen?
  - magnitude:             how many people / how much of the economy is affected?
  - vulnerable_population: how directly does it hit vulnerable groups?

Weights are a simple, stated judgement call (not derived from data) —
severity and plausibility matter most because a severe-but-unlikely risk
and a mild-but-certain one are both less concerning than a severe-and-likely
one. This is documented here so it can be cited/defended in the paper as
"the rule" rather than a black box.
"""

WEIGHTS = {
    "severity": 0.35,
    "plausibility": 0.30,
    "magnitude": 0.20,
    "vulnerable_population": 0.15,
}


def _clamp(value: float, lo: float = 0, hi: float = 100) -> float:
    return max(lo, min(hi, value))


def compute_risk_score(dimensions: dict) -> dict:
    """
    dimensions: {"severity": 0-100, "plausibility": 0-100,
                 "magnitude": 0-100, "vulnerable_population": 0-100}

    Returns: {
        "overall_risk_score": int 0-100,
        "risk_level": "High" | "Medium" | "Low",
        "dimensions": the (clamped) input dimensions,
        "explanation": human-readable justification string
    }
    """
    clamped = {k: _clamp(float(dimensions.get(k, 50))) for k in WEIGHTS}

    score = sum(clamped[k] * WEIGHTS[k] for k in WEIGHTS)
    score = round(_clamp(score))

    if score >= 70:
        level = "High"
    elif score >= 40:
        level = "Medium"
    else:
        level = "Low"

    ranked = sorted(clamped.items(), key=lambda kv: kv[1] * WEIGHTS[kv[0]], reverse=True)
    top_dim, top_val = ranked[0]
    dim_labels = {
        "severity": "the severity of potential negative side-effects",
        "plausibility": "how likely those effects are to occur",
        "magnitude": "the number of people/sectors affected",
        "vulnerable_population": "the direct impact on vulnerable groups",
    }

    explanation = (
        f"Overall risk is classified as {level} ({score}/100). "
        f"The biggest contributor is {dim_labels[top_dim]} (rated {round(top_val)}/100). "
        f"Score = severity×{WEIGHTS['severity']} + plausibility×{WEIGHTS['plausibility']} "
        f"+ magnitude×{WEIGHTS['magnitude']} + vulnerable_population×{WEIGHTS['vulnerable_population']}."
    )

    return {
        "overall_risk_score": score,
        "risk_level": level,
        "dimensions": {k: round(v) for k, v in clamped.items()},
        "explanation": explanation,
    }