"""Category weights and score tier logic for TrustLedger credit scoring."""

# Feature-to-category mapping with weights within each category
CATEGORY_WEIGHTS = {
    "upi_financial_behavior": {
        "weight": 0.25,
        "features": {
            "upi_inflow_log": 0.35,
            "upi_outflow_ratio": 0.25,
            "upi_consistency": 0.25,
            "savings_ratio": 0.15,
        },
    },
    "bank_history": {
        "weight": 0.20,
        "features": {
            "bank_balance_log": 0.50,
            "bank_history_months": 0.30,
            "income_stability": 0.20,
        },
    },
    "utility_payments": {
        "weight": 0.15,
        "features": {
            "utility_payment_ratio": 0.70,
            "loan_repayment": 0.30,
        },
    },
    "defi_repayment": {
        "weight": 0.20,
        "features": {
            "defi_repayment_ratio": 0.55,
            "defi_loan_count": 0.45,
        },
    },
    "wallet_behavior": {
        "weight": 0.12,
        "features": {
            "wallet_age_normalized": 0.35,
            "wallet_balance_log": 0.35,
            "nft_collateral": 0.15,
            "dao_participation_normalized": 0.15,
        },
    },
    "behavior_tokens": {
        "weight": 0.08,
        "features": {
            "behavior_tokens_normalized": 1.0,
        },
    },
}


SCORE_TIERS = [
    {"min": 800, "max": 900, "label": "Excellent", "recommendation": "APPROVE"},
    {"min": 700, "max": 799, "label": "Good", "recommendation": "APPROVE"},
    {"min": 600, "max": 699, "label": "Fair", "recommendation": "REVIEW"},
    {"min": 450, "max": 599, "label": "Below Average", "recommendation": "REVIEW"},
    {"min": 300, "max": 449, "label": "Poor", "recommendation": "DECLINE"},
]


def get_recommendation(score: int) -> str:
    """Return APPROVE / REVIEW / DECLINE based on score."""
    for tier in SCORE_TIERS:
        if tier["min"] <= score <= tier["max"]:
            return tier["recommendation"]
    return "DECLINE"


def get_tier_label(score: int) -> str:
    """Return human-readable tier label."""
    for tier in SCORE_TIERS:
        if tier["min"] <= score <= tier["max"]:
            return tier["label"]
    return "Unknown"
