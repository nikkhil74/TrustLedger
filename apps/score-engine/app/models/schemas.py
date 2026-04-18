from pydantic import BaseModel, Field


class OffChainData(BaseModel):
    upi_avg_monthly_inflow: float = Field(ge=0, description="Average monthly UPI inflow in INR")
    upi_avg_monthly_outflow: float = Field(ge=0, description="Average monthly UPI outflow in INR")
    upi_consistency_score: float = Field(ge=0, le=1, description="UPI transaction consistency 0-1")
    bank_avg_balance: float = Field(ge=0, description="Average bank balance in INR")
    bank_months_of_history: int = Field(ge=0, description="Months of bank history available")
    utility_bills_paid_on_time: int = Field(ge=0, description="Number of utility bills paid on time")
    utility_bills_total: int = Field(ge=0, description="Total number of utility bills")
    loan_repayment_history: float = Field(ge=0, le=1, description="Loan repayment ratio 0-1")
    income_stability_score: float = Field(ge=0, le=1, description="Income stability measure 0-1")


class OnChainData(BaseModel):
    defi_loans_repaid: int = Field(ge=0, description="Number of DeFi loans fully repaid")
    defi_default_count: int = Field(ge=0, description="Number of DeFi loan defaults")
    wallet_age_days: int = Field(ge=0, description="Wallet age in days")
    avg_wallet_balance_usd: float = Field(ge=0, description="Average wallet balance in USD")
    nft_collateral_count: int = Field(ge=0, description="NFTs used as collateral")
    dao_participation_count: int = Field(ge=0, description="DAO governance participations")
    behavior_token_balance: int = Field(ge=0, description="TrustLedger behavior token balance")


class ScoreRequest(BaseModel):
    user_id: str
    wallet_address: str
    off_chain_data: OffChainData
    on_chain_data: OnChainData


class ScoreBreakdown(BaseModel):
    upi_financial_behavior: float
    bank_history: float
    utility_payments: float
    defi_repayment: float
    wallet_behavior: float
    behavior_tokens: float


class ScoreResponse(BaseModel):
    score: int = Field(ge=300, le=900, description="Credit score 300-900")
    confidence: float = Field(ge=0, le=1, description="Model confidence 0-1")
    breakdown: ScoreBreakdown
    recommendation: str = Field(description="APPROVE / REVIEW / DECLINE")
    data_completeness: float = Field(ge=0, le=1, description="Data completeness ratio")


class ExplainRequest(BaseModel):
    user_id: str
    wallet_address: str
    off_chain_data: OffChainData
    on_chain_data: OnChainData


class ExplainResponse(BaseModel):
    score: int
    feature_importance: dict[str, float]
    top_positive_factors: list[str]
    top_negative_factors: list[str]
    recommendations: list[str]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str
