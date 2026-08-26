from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Any

from .db import get_db_session
from .factors.implementations import ValueFactor, QualityFactor, MomentumFactor, SentimentFactor
from .health import AlphaHealthMonitor, FactorStatus
from .composite import CompositeEngine, CompositeValidationError

router = APIRouter(prefix="/api/v1/alpha", tags=["alpha"])

# Instantiate mock factor implementations for routes
active_factors = {
    "val": ValueFactor(),
    "qual": QualityFactor(),
    "mom": MomentumFactor(),
    "sent": SentimentFactor()
}

@router.get("/factors")
def get_factors(db=Depends(get_db_session)):
    """
    Returns the list of available factors with their computed point-in-time statistics.
    For Phase 1, we use static fallback values for the stats to populate the UI, 
    but the structure uses real models.
    """
    res = []
    for f_id, f in active_factors.items():
        # In a full run, we would query historical IC and calculate status dynamically.
        # Here we mock the result format expected by the frontend.
        res.append({
            "id": f.factor_id,
            "name": f.name,
            "category": "Fundamentals" if f_id in ["val", "qual"] else ("Alternative" if f_id == "sent" else "Market"),
            "status": "ACTIVE" if f_id != "sent" else "MONITOR",
            "sharpe_ratio": 1.2 if f_id == "val" else 0.8,
            "ic": f.diagnostics().get("expected_ic", 0.05),
            "half_life": 20 if f_id != "mom" else 5
        })
    return res

@router.get("/correlation")
def get_correlation(db=Depends(get_db_session)):
    """
    Returns factor correlation matrix.
    """
    # Mocking correlation matrix for UI format
    return {
        "factors": [f.name for f in active_factors.values()],
        "matrix": [
            [1.0, 0.2, -0.1, 0.05],
            [0.2, 1.0, 0.1, -0.05],
            [-0.1, 0.1, 1.0, 0.15],
            [0.05, -0.05, 0.15, 1.0]
        ]
    }

class CompositeRequest(BaseModel):
    weights: Dict[str, float]

@router.post("/composite/diagnostics")
def get_composite_diagnostics(req: CompositeRequest):
    """
    Validates composite weights and returns forward-looking diagnostics.
    """
    try:
        # HARD VALIDATION: FAIL-CLOSED if sum != 100%
        CompositeEngine.validate_weights(req.weights)
        
        # Mock some return data for a valid configuration
        return {
            "status": "HEALTHY",
            "sharpe": 1.8,
            "turnover": 0.3,
            "ic": 0.06
        }
    except CompositeValidationError as e:
        # Using 422 Unprocessable Entity for validation failures
        raise HTTPException(status_code=422, detail=str(e))

@router.post("/composite/backtest")
def run_backtest(req: CompositeRequest):
    """
    Initiates a backtest for the composite.
    """
    try:
        CompositeEngine.validate_weights(req.weights)
        # Phase 3 will actually queue the backtest. For Phase 1 we return success.
        return {"status": "SUCCESS", "message": "Backtest initiated."}
    except CompositeValidationError as e:
        raise HTTPException(status_code=422, detail=str(e))
