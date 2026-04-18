import numpy as np

from app.models.schemas import OffChainData, OnChainData


FEATURE_NAMES = [
    # Off-chain (9 features)
    "upi_inflow_log",
    "upi_outflow_ratio",
    "upi_consistency",
    "bank_balance_log",
    "bank_history_months",
    "utility_payment_ratio",
    "loan_repayment",
    "income_stability",
    "savings_ratio",
    # On-chain (7 features)
    "defi_repayment_ratio",
    "wallet_age_normalized",
    "wallet_balance_log",
    "nft_collateral",
    "dao_participation_normalized",
    "behavior_tokens_normalized",
    "defi_loan_count",
]


def extract_features(
    off_chain: OffChainData, on_chain: OnChainData
) -> np.ndarray:
    """Transform raw user data into a normalized feature vector."""

    # Off-chain features
    upi_inflow_log = np.log1p(off_chain.upi_avg_monthly_inflow / 1000)
    upi_outflow_ratio = (
        off_chain.upi_avg_monthly_outflow / max(off_chain.upi_avg_monthly_inflow, 1)
    )
    upi_consistency = off_chain.upi_consistency_score
    bank_balance_log = np.log1p(off_chain.bank_avg_balance / 10000)
    bank_history_months = min(off_chain.bank_months_of_history / 60, 1.0)
    utility_payment_ratio = (
        off_chain.utility_bills_paid_on_time / max(off_chain.utility_bills_total, 1)
    )
    loan_repayment = off_chain.loan_repayment_history
    income_stability = off_chain.income_stability_score
    savings_ratio = max(
        0,
        (off_chain.upi_avg_monthly_inflow - off_chain.upi_avg_monthly_outflow)
        / max(off_chain.upi_avg_monthly_inflow, 1),
    )

    # On-chain features
    total_defi_loans = on_chain.defi_loans_repaid + on_chain.defi_default_count
    defi_repayment_ratio = (
        on_chain.defi_loans_repaid / max(total_defi_loans, 1) if total_defi_loans > 0 else 0.5
    )
    wallet_age_normalized = min(on_chain.wallet_age_days / 730, 1.0)  # Normalize to 2 years
    wallet_balance_log = np.log1p(on_chain.avg_wallet_balance_usd / 1000)
    nft_collateral = min(on_chain.nft_collateral_count / 5, 1.0)
    dao_participation_normalized = min(on_chain.dao_participation_count / 20, 1.0)
    behavior_tokens_normalized = min(on_chain.behavior_token_balance / 100, 1.0)
    defi_loan_count = min(total_defi_loans / 10, 1.0)

    features = np.array(
        [
            upi_inflow_log,
            upi_outflow_ratio,
            upi_consistency,
            bank_balance_log,
            bank_history_months,
            utility_payment_ratio,
            loan_repayment,
            income_stability,
            savings_ratio,
            defi_repayment_ratio,
            wallet_age_normalized,
            wallet_balance_log,
            nft_collateral,
            dao_participation_normalized,
            behavior_tokens_normalized,
            defi_loan_count,
        ],
        dtype=np.float32,
    )

    return features


def compute_data_completeness(
    off_chain: OffChainData, on_chain: OnChainData
) -> float:
    """Estimate how complete the user's data profile is (0-1)."""
    completeness_signals = [
        off_chain.upi_avg_monthly_inflow > 0,
        off_chain.bank_avg_balance > 0,
        off_chain.bank_months_of_history >= 6,
        off_chain.utility_bills_total > 0,
        off_chain.loan_repayment_history > 0,
        on_chain.wallet_age_days > 30,
        on_chain.avg_wallet_balance_usd > 0,
        (on_chain.defi_loans_repaid + on_chain.defi_default_count) > 0,
        on_chain.behavior_token_balance > 0,
        on_chain.dao_participation_count > 0,
    ]
    return sum(completeness_signals) / len(completeness_signals)
