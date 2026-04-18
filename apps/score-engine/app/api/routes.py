from fastapi import APIRouter, Depends

from app.models.schemas import (
    ScoreRequest,
    ScoreResponse,
    ExplainRequest,
    ExplainResponse,
    HealthResponse,
)
from app.api.dependencies import get_engine
from app.scoring.engine import CreditScoreEngine

router = APIRouter()


@router.post("/score/compute", response_model=ScoreResponse)
async def compute_score(
    request: ScoreRequest,
    engine: CreditScoreEngine = Depends(get_engine),
) -> ScoreResponse:
    """Compute a TrustLedger credit score from off-chain and on-chain data."""
    return engine.compute_score(request.off_chain_data, request.on_chain_data)


@router.post("/score/explain", response_model=ExplainResponse)
async def explain_score(
    request: ExplainRequest,
    engine: CreditScoreEngine = Depends(get_engine),
) -> ExplainResponse:
    """Explain a credit score with feature importance and recommendations."""
    return engine.explain_score(request.off_chain_data, request.on_chain_data)


@router.get("/health", response_model=HealthResponse)
async def health_check(
    engine: CreditScoreEngine = Depends(get_engine),
) -> HealthResponse:
    return HealthResponse(
        status="healthy",
        model_loaded=engine.is_model_loaded,
        version="0.1.0",
    )
