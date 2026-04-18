from app.scoring.engine import CreditScoreEngine

_engine: CreditScoreEngine | None = None


def get_engine() -> CreditScoreEngine:
    """Singleton dependency for the scoring engine."""
    global _engine
    if _engine is None:
        _engine = CreditScoreEngine()
    return _engine
