"""
Monte Carlo uncertainty analysis for the policy impact model.

Samples every uncertain input N times, runs the SAME model code on each
sample, and summarises the distribution. Sampled:
  1. Risk dimensions ~ Normal(LLM estimate, DIM_SIGMA), clipped to [0, 100],
     with a shared "analyst bias" factor (DIM_CORRELATION).
  2. Adaptability ~ Normal(prior, ADAPT_SIGMA) per stakeholder group.
  3. Model constants (equilibrium factor, decay rate) with relative noise.
Sigmas are stated assumptions, NOT calibrated to historical outcomes.
"""

import hashlib
import json

import numpy as np

from risk_engine import WEIGHTS
from simulation import (
    DECAY_BASE,
    DECAY_SLOPE,
    EQUILIBRIUM_FACTOR,
    stakeholder_arrays,
    trajectory,
)

DIM_SIGMA = 12.0
DIM_CORRELATION = 0.30
ADAPT_SIGMA = 0.15
STRUCT_REL_SIGMA = 0.15

MAX_TRIALS = 100_000
DEFAULT_TRIALS = 10_000

TIME_GRID = [
    (0.0, "Now"), (0.5, "6 months"), (1.0, "1 year"), (1.5, "18 months"),
    (2.0, "2 years"), (3.0, "3 years"), (4.0, "4 years"), (5.0, "5 years"),
]

DIM_KEYS = list(WEIGHTS.keys())
WEIGHT_VEC = np.array([WEIGHTS[k] for k in DIM_KEYS])


def _seed_from_inputs(dimensions: dict, stakeholders: list, n_trials: int) -> int:
    payload = json.dumps(
        {"d": {k: dimensions.get(k) for k in DIM_KEYS}, "s": stakeholders, "n": n_trials},
        sort_keys=True, default=str,
    )
    return int(hashlib.sha256(payload.encode()).hexdigest()[:8], 16)


def _pct(a: np.ndarray, q) -> np.ndarray:
    return np.percentile(a, q, axis=0)


def run_monte_carlo(
    dimensions: dict,
    stakeholders: list,
    n_trials: int = DEFAULT_TRIALS,
    seed: int | None = None,
    dim_sigma: float = DIM_SIGMA,
    adapt_sigma: float = ADAPT_SIGMA,
    struct_rel_sigma: float = STRUCT_REL_SIGMA,
    dim_correlation: float = DIM_CORRELATION,
) -> dict:
    n_trials = int(max(100, min(MAX_TRIALS, n_trials)))
    if seed is None:
        seed = _seed_from_inputs(dimensions, stakeholders, n_trials)
    rng = np.random.default_rng(seed)

    # 1. Risk dimensions (correlated errors)
    point = np.clip(np.array([float(dimensions.get(k, 50)) for k in DIM_KEYS]), 0, 100)
    shared = rng.standard_normal((n_trials, 1))
    own = rng.standard_normal((n_trials, len(DIM_KEYS)))
    noise = np.sqrt(dim_correlation) * shared + np.sqrt(1 - dim_correlation) * own
    dims = np.clip(point + dim_sigma * noise, 0, 100)
    risk = dims @ WEIGHT_VEC

    # 2. Stakeholder adaptability
    priors, sev_w = stakeholder_arrays(stakeholders)
    adapt_each = np.clip(
        priors + adapt_sigma * rng.standard_normal((n_trials, len(priors))), 0.05, 0.95
    )
    adaptability = (adapt_each * sev_w).sum(axis=1) / sev_w.sum()

    # 3. Model-structure constants
    def jitter(base):
        return base * np.clip(1 + struct_rel_sigma * rng.standard_normal(n_trials), 0.5, 1.5)

    eq_factor = np.clip(jitter(EQUILIBRIUM_FACTOR), 0.05, 0.95)
    decay_base = jitter(DECAY_BASE)
    decay_slope = jitter(DECAY_SLOPE)

    # Run the model for every sample and time point
    times = np.array([t for t, _ in TIME_GRID])
    traj = np.clip(
        trajectory(
            risk[:, None], adaptability[:, None], times[None, :],
            eq_factor[:, None], decay_base[:, None], decay_slope[:, None],
        ),
        0, 100,
    )

    q = {p: _pct(traj, p) for p in (5, 10, 25, 50, 75, 90, 95)}
    fan = [
        {
            "t_years": t,
            "label": label,
            "mean": round(float(traj[:, i].mean()), 1),
            **{f"p{p}": round(float(q[p][i]), 1) for p in (5, 10, 25, 50, 75, 90, 95)},
        }
        for i, (t, label) in enumerate(TIME_GRID)
    ]

    counts, edges = np.histogram(risk, bins=20, range=(0, 100))
    histogram = [
        {"bin_start": int(edges[i]), "bin_end": int(edges[i + 1]),
         "share": round(float(counts[i] / n_trials), 4)}
        for i in range(len(counts))
    ]

    i3 = [t for t, _ in TIME_GRID].index(3.0)
    i5 = [t for t, _ in TIME_GRID].index(5.0)

    # Which uncertain input drives the spread of the 5-year outcome?
    out5 = traj[:, i5]
    drivers = {
        **{f"risk_dim:{k}": dims[:, j] for j, k in enumerate(DIM_KEYS)},
        "stakeholder_adaptability": adaptability,
        "model:equilibrium_factor": eq_factor,
        "model:decay_rate": decay_base + decay_slope * adaptability,
    }
    sensitivity = []
    for name, x in drivers.items():
        if x.std() < 1e-12 or out5.std() < 1e-12:
            c = 0.0
        else:
            c = float(np.corrcoef(x, out5)[0, 1])
        sensitivity.append({"input": name, "correlation": round(c, 3)})
    sensitivity.sort(key=lambda d: abs(d["correlation"]), reverse=True)

    return {
        "n_trials": n_trials,
        "seed": seed,
        "risk_score": {
            "mean": round(float(risk.mean()), 1),
            "std": round(float(risk.std()), 1),
            "p5": round(float(np.percentile(risk, 5)), 1),
            "p10": round(float(np.percentile(risk, 10)), 1),
            "p50": round(float(np.percentile(risk, 50)), 1),
            "p90": round(float(np.percentile(risk, 90)), 1),
            "p95": round(float(np.percentile(risk, 95)), 1),
            "histogram": histogram,
        },
        "probabilities": {
            "high_risk_now": round(float((risk >= 70).mean()), 4),
            "medium_or_worse_now": round(float((risk >= 40).mean()), 4),
            "high_impact_at_3y": round(float((traj[:, i3] >= 70).mean()), 4),
            "medium_or_worse_at_3y": round(float((traj[:, i3] >= 40).mean()), 4),
            "high_impact_at_5y": round(float((traj[:, i5] >= 70).mean()), 4),
            "medium_or_worse_at_5y": round(float((traj[:, i5] >= 40).mean()), 4),
        },
        "worst_case_95": {"now": round(float(np.percentile(risk, 95)), 1),
                          "at_3y": round(float(q[95][i3]), 1),
                          "at_5y": round(float(q[95][i5]), 1)},
        "fan": fan,
        "sensitivity": sensitivity,
        "assumptions": {
            "method": "Monte Carlo propagation of input uncertainty through the "
                      "deterministic risk + decay model (uncalibrated)",
            "risk_dimension_sigma": dim_sigma,
            "risk_dimension_correlation": dim_correlation,
            "adaptability_sigma": adapt_sigma,
            "model_structure_rel_sigma": struct_rel_sigma,
        },
    }