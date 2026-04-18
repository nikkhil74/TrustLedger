"""Tests for the TrustLedger scoring engine."""

import numpy as np
import pytest

from app.models.schemas import OffChainData, OnChainData
from app.models.features import extract_features, compute_data_completeness, FEATURE_NAMES
from app.scoring.engine import CreditScoreEngine
from app.scoring import get_recommendation, get_tier_label


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def good_off_chain() -> OffChainData:
    return OffChainData(
        upi_avg_monthly_inflow=45000,
        upi_avg_monthly_outflow=32000,
        upi_consistency_score=0.85,
        bank_avg_balance=125000,
        bank_months_of_history=24,
        utility_bills_paid_on_time=11,
        utility_bills_total=12,
        loan_repayment_history=0.95,
        income_stability_score=0.78,
    )


@pytest.fixture
def good_on_chain() -> OnChainData:
    return OnChainData(
        defi_loans_repaid=3,
        defi_default_count=0,
        wallet_age_days=365,
        avg_wallet_balance_usd=2500,
        nft_collateral_count=0,
        dao_participation_count=5,
        behavior_token_balance=25,
    )


@pytest.fixture
def poor_off_chain() -> OffChainData:
    return OffChainData(
        upi_avg_monthly_inflow=5000,
        upi_avg_monthly_outflow=4800,
        upi_consistency_score=0.2,
        bank_avg_balance=3000,
        bank_months_of_history=3,
        utility_bills_paid_on_time=2,
        utility_bills_total=12,
        loan_repayment_history=0.3,
        income_stability_score=0.2,
    )


@pytest.fixture
def poor_on_chain() -> OnChainData:
    return OnChainData(
        defi_loans_repaid=0,
        defi_default_count=2,
        wallet_age_days=30,
        avg_wallet_balance_usd=50,
        nft_collateral_count=0,
        dao_participation_count=0,
        behavior_token_balance=0,
    )


@pytest.fixture
def engine() -> CreditScoreEngine:
    return CreditScoreEngine()


# ---------------------------------------------------------------------------
# Feature Extraction Tests
# ---------------------------------------------------------------------------

class TestFeatureExtraction:
    def test_feature_vector_length(self, good_off_chain: OffChainData, good_on_chain: OnChainData):
        features = extract_features(good_off_chain, good_on_chain)
        assert len(features) == len(FEATURE_NAMES)
        assert features.dtype == np.float32

    def test_features_are_bounded(self, good_off_chain: OffChainData, good_on_chain: OnChainData):
        features = extract_features(good_off_chain, good_on_chain)
        # Most features should be in [0, ~4] range (log-transformed)
        assert np.all(features >= 0)

    def test_zero_data_produces_features(self):
        off = OffChainData(
            upi_avg_monthly_inflow=0, upi_avg_monthly_outflow=0,
            upi_consistency_score=0, bank_avg_balance=0,
            bank_months_of_history=0, utility_bills_paid_on_time=0,
            utility_bills_total=0, loan_repayment_history=0,
            income_stability_score=0,
        )
        on = OnChainData(
            defi_loans_repaid=0, defi_default_count=0,
            wallet_age_days=0, avg_wallet_balance_usd=0,
            nft_collateral_count=0, dao_participation_count=0,
            behavior_token_balance=0,
        )
        features = extract_features(off, on)
        assert len(features) == len(FEATURE_NAMES)
        assert np.all(np.isfinite(features))

    def test_data_completeness_full(self, good_off_chain: OffChainData, good_on_chain: OnChainData):
        completeness = compute_data_completeness(good_off_chain, good_on_chain)
        assert 0.7 <= completeness <= 1.0

    def test_data_completeness_empty(self):
        off = OffChainData(
            upi_avg_monthly_inflow=0, upi_avg_monthly_outflow=0,
            upi_consistency_score=0, bank_avg_balance=0,
            bank_months_of_history=0, utility_bills_paid_on_time=0,
            utility_bills_total=0, loan_repayment_history=0,
            income_stability_score=0,
        )
        on = OnChainData(
            defi_loans_repaid=0, defi_default_count=0,
            wallet_age_days=0, avg_wallet_balance_usd=0,
            nft_collateral_count=0, dao_participation_count=0,
            behavior_token_balance=0,
        )
        completeness = compute_data_completeness(off, on)
        assert completeness == 0.0


# ---------------------------------------------------------------------------
# Scoring Engine Tests
# ---------------------------------------------------------------------------

class TestScoringEngine:
    def test_good_profile_scores_high(
        self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData,
    ):
        result = engine.compute_score(good_off_chain, good_on_chain)
        assert 300 <= result.score <= 900
        assert result.score >= 600, f"Good profile should score >= 600, got {result.score}"
        assert result.recommendation in ("APPROVE", "REVIEW")

    def test_poor_profile_scores_low(
        self, engine: CreditScoreEngine, poor_off_chain: OffChainData, poor_on_chain: OnChainData,
    ):
        result = engine.compute_score(poor_off_chain, poor_on_chain)
        assert 300 <= result.score <= 900
        assert result.score < 600, f"Poor profile should score < 600, got {result.score}"

    def test_score_boundaries(self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData):
        result = engine.compute_score(good_off_chain, good_on_chain)
        assert 300 <= result.score <= 900

    def test_confidence_range(self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData):
        result = engine.compute_score(good_off_chain, good_on_chain)
        assert 0 <= result.confidence <= 1

    def test_breakdown_sum(self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData):
        result = engine.compute_score(good_off_chain, good_on_chain)
        bd = result.breakdown
        total = (
            bd.upi_financial_behavior + bd.bank_history + bd.utility_payments
            + bd.defi_repayment + bd.wallet_behavior + bd.behavior_tokens
        )
        # Weighted sum should be positive and reasonable (may exceed 1.0 with log features)
        assert 0 < total <= 2.0

    def test_data_completeness_range(self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData):
        result = engine.compute_score(good_off_chain, good_on_chain)
        assert 0 <= result.data_completeness <= 1

    def test_recommendation_values(self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData):
        result = engine.compute_score(good_off_chain, good_on_chain)
        assert result.recommendation in ("APPROVE", "REVIEW", "DECLINE")

    def test_model_not_loaded_uses_rules(self, engine: CreditScoreEngine):
        assert not engine.is_model_loaded


# ---------------------------------------------------------------------------
# Explain Score Tests
# ---------------------------------------------------------------------------

class TestExplainScore:
    def test_explain_returns_factors(
        self, engine: CreditScoreEngine, good_off_chain: OffChainData, good_on_chain: OnChainData,
    ):
        result = engine.explain_score(good_off_chain, good_on_chain)
        assert result.score >= 300
        assert len(result.feature_importance) > 0
        assert isinstance(result.top_positive_factors, list)
        assert isinstance(result.top_negative_factors, list)
        assert isinstance(result.recommendations, list)

    def test_poor_profile_has_negative_factors(
        self, engine: CreditScoreEngine, poor_off_chain: OffChainData, poor_on_chain: OnChainData,
    ):
        result = engine.explain_score(poor_off_chain, poor_on_chain)
        assert len(result.top_negative_factors) > 0
        assert len(result.recommendations) > 0


# ---------------------------------------------------------------------------
# Tier / Recommendation Helpers
# ---------------------------------------------------------------------------

class TestTiers:
    def test_excellent_score(self):
        assert get_recommendation(850) == "APPROVE"
        assert get_tier_label(850) == "Excellent"

    def test_good_score(self):
        assert get_recommendation(720) == "APPROVE"
        assert get_tier_label(720) == "Good"

    def test_fair_score(self):
        assert get_recommendation(650) == "REVIEW"
        assert get_tier_label(650) == "Fair"

    def test_poor_score(self):
        assert get_recommendation(350) == "DECLINE"
        assert get_tier_label(350) == "Poor"

    def test_boundary_300(self):
        assert get_recommendation(300) == "DECLINE"

    def test_boundary_900(self):
        assert get_recommendation(900) == "APPROVE"
