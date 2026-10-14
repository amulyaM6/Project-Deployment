from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from monte_carlo import DEFAULT_TRIALS, MAX_TRIALS, run_monte_carlo

router = APIRouter()


class SimulateRequest(BaseModel):
    risk_dimensions: dict
    stakeholders: list = Field(default_factory=list)
    n_trials: int = Field(DEFAULT_TRIALS, ge=100, le=MAX_TRIALS)
    seed: Optional[int] = None


@router.post("/simulate")
def simulate(req: SimulateRequest):
    return run_monte_carlo(req.risk_dimensions, req.stakeholders, req.n_trials, req.seed)