from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "TrustLedger Score Engine"
    debug: bool = False
    host: str = "0.0.0.0"
    port: int = 8000

    # Score boundaries
    score_min: int = 300
    score_max: int = 900

    # Model path (for future persisted model)
    model_path: str = "models/xgboost_model.json"

    # Weights for off-chain vs on-chain
    off_chain_weight: float = 0.6
    on_chain_weight: float = 0.4

    model_config = {"env_prefix": "SCORE_ENGINE_", "env_file": ".env"}


settings = Settings()
