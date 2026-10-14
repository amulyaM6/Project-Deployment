from monte_carlo import run_monte_carlo, TIME_GRID
from risk_engine import compute_risk_score
from simulation import simulate_timeline

DIMS = {"severity": 70, "plausibility": 65, "magnitude": 68, "vulnerable_population": 60}
STK = [{"group": "Farmers", "severity": "high"}, {"group": "Exporters", "severity": "low"}]


def test_reproducible_with_same_inputs():
    assert run_monte_carlo(DIMS, STK, n_trials=2000) == run_monte_carlo(DIMS, STK, n_trials=2000)


def test_different_seed_changes_result():
    a = run_monte_carlo(DIMS, STK, n_trials=2000, seed=1)
    b = run_monte_carlo(DIMS, STK, n_trials=2000, seed=2)
    assert a["fan"][-1]["p50"] != b["fan"][-1]["p50"] or a["risk_score"]["mean"] != b["risk_score"]["mean"]


def test_zero_uncertainty_collapses_to_deterministic_model():
    """With every sigma = 0 the Monte Carlo must reproduce the deterministic
    pipeline -- proof it runs the same model, not a lookalike."""
    r = run_monte_carlo(DIMS, STK, n_trials=500, dim_sigma=0, adapt_sigma=0, struct_rel_sigma=0)
    det_score = compute_risk_score(DIMS)["overall_risk_score"]
    assert abs(r["risk_score"]["p50"] - det_score) <= 0.5
    det_tl = {p["period"]: p["impact_score"] for p in simulate_timeline(det_score, STK)}
    for row in r["fan"]:
        if row["label"] in det_tl:
            assert abs(row["p50"] - det_tl[row["label"]]) <= 1.0
            assert row["p10"] == row["p90"]


def test_percentiles_are_ordered_and_bounded():
    r = run_monte_carlo(DIMS, STK, n_trials=3000)
    for row in r["fan"]:
        assert 0 <= row["p5"] <= row["p10"] <= row["p25"] <= row["p50"] <= row["p75"] <= row["p90"] <= row["p95"] <= 100
    assert len(r["fan"]) == len(TIME_GRID)


def test_uncertainty_fan_widens_with_larger_sigma():
    lo = run_monte_carlo(DIMS, STK, n_trials=3000, seed=7, dim_sigma=5)
    hi = run_monte_carlo(DIMS, STK, n_trials=3000, seed=7, dim_sigma=20)
    w = lambda r: r["fan"][0]["p90"] - r["fan"][0]["p10"]
    assert w(hi) > w(lo)


def test_median_impact_decays_over_time():
    meds = [row["p50"] for row in run_monte_carlo(DIMS, STK, n_trials=3000)["fan"]]
    assert meds == sorted(meds, reverse=True)


def test_probabilities_valid_and_histogram_sums_to_one():
    r = run_monte_carlo(DIMS, STK, n_trials=3000)
    assert all(0 <= v <= 1 for v in r["probabilities"].values())
    assert abs(sum(b["share"] for b in r["risk_score"]["histogram"]) - 1.0) < 1e-2


def test_high_risk_input_gives_higher_high_risk_probability():
    low = run_monte_carlo({k: 20 for k in DIMS}, STK, n_trials=3000)
    high = run_monte_carlo({k: 85 for k in DIMS}, STK, n_trials=3000)
    assert high["probabilities"]["high_risk_now"] > low["probabilities"]["high_risk_now"]


def test_trial_count_is_clamped_and_reported():
    assert run_monte_carlo(DIMS, STK, n_trials=10**9)["n_trials"] == 100_000
    assert run_monte_carlo(DIMS, STK, n_trials=1)["n_trials"] == 100


def test_handles_missing_stakeholders_and_dimensions():
    r = run_monte_carlo({}, [], n_trials=500)
    assert r["n_trials"] == 500 and len(r["fan"]) == len(TIME_GRID)