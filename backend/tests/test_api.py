from fastapi import FastAPI
from fastapi.testclient import TestClient
from monte_carlo_api import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)
BODY = {"risk_dimensions": {"severity": 70, "plausibility": 60, "magnitude": 50, "vulnerable_population": 40},
        "stakeholders": [{"group": "Farmers", "severity": "high"}]}


def test_simulate_returns_fan_and_trials():
    r = client.post("/simulate", json={**BODY, "n_trials": 5000})
    assert r.status_code == 200
    assert r.json()["n_trials"] == 5000 and len(r.json()["fan"]) == 8


def test_simulate_rejects_bad_trial_count():
    assert client.post("/simulate", json={**BODY, "n_trials": 10**7}).status_code == 422
    assert client.post("/simulate", json={**BODY, "n_trials": 5}).status_code == 422