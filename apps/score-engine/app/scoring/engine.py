"""XGBoost-based credit scoring engine with rule-based fallback."""

from __future__ import annotations

import numpy as np
from xgboost import XGBRegressor

from app.config import settings
from app.models.features import FEATURE_NAMES, extract_features, compute_data_completeness
from app.models.schemas import (
    OffChainData,
    OnChainData,
    ScoreBreakdown,
    ScoreResponse,
    ExplainResponse,
)
from app.scoring import CATEGORY_WEIGHTS, get_recommendation


class CreditScoreEngine:
    """Hybrid credit scoring engine using XGBoost + rule-based weighting."""

    def __init__(self) -> None:
        self.model: XGBRegressor | None = None
        self._is_fitted = False
        self._try_load_model()

    def _try_load_model(self) -> None:
        """Attempt to load a persisted XGBoost model."""
        try:
            model = XGBRegressor()
            model.load_model(settings.model_path)
            self.model = model
            self._is_fitted = True
        except Exception:
            # No persisted model found; will use rule-based scoring
            self.model = None
            self._is_fitted = False

    @property
    def is_model_loaded(self) -> bool:
        return self._is_fitted

    def compute_score(
        self, off_chain: OffChainData, on_chain: OnChainData
    ) -> ScoreResponse:
        """Compute a credit score from raw data."""
        features = extract_features(off_chain, on_chain)
        data_completeness = compute_data_completeness(off_chain, on_chain)

        if self._is_fitted and self.model is not None:
            raw_score = float(self.model.predict(features.reshape(1, -1))[0])
            raw_score = np.clip(raw_score, 0.0, 1.0)
        else:
            raw_score = self._rule_based_score(features)

        score = int(np.round(settings.score_min + raw_score * (settings.score_max - settings.score_min)))
        score = max(settings.score_min, min(settings.score_max, score))

        breakdown = self._compute_breakdown(features)
        confidence = self._compute_confidence(features, data_completeness)

        return ScoreResponse(
            score=score,
            confidence=round(confidence, 2),
            breakdown=breakdown,
            recommendation=get_recommendation(score),
            data_completeness=round(data_completeness, 2),
        )

    def explain_score(
        self, off_chain: OffChainData, on_chain: OnChainData
    ) -> ExplainResponse:
        """Generate an explanation of the score with factor analysis."""
        features = extract_features(off_chain, on_chain)

        if self._is_fitted and self.model is not None:
            raw_score = float(self.model.predict(features.reshape(1, -1))[0])
            raw_score = np.clip(raw_score, 0.0, 1.0)
        else:
            raw_score = self._rule_based_score(features)

        score = int(np.round(settings.score_min + raw_score * (settings.score_max - settings.score_min)))
        score = max(settings.score_min, min(settings.score_max, score))

        feature_importance = self._get_feature_importance(features)
        positive, negative = self._analyze_factors(features)
        recommendations = self._generate_recommendations(features, negative)

        return ExplainResponse(
            score=score,
            feature_importance=feature_importance,
            top_positive_factors=positive[:5],
            top_negative_factors=negative[:5],
            recommendations=recommendations[:5],
        )

    def _rule_based_score(self, features: np.ndarray) -> float:
        """Weighted rule-based scoring when no ML model is available."""
        feature_dict = dict(zip(FEATURE_NAMES, features))
        total_score = 0.0

        for _category, config in CATEGORY_WEIGHTS.items():
            cat_score = 0.0
            for feat_name, feat_weight in config["features"].items():
                val = float(feature_dict.get(feat_name, 0.0))
                # Invert upi_outflow_ratio: lower is better
                if feat_name == "upi_outflow_ratio":
                    val = max(0, 1.0 - val)
                cat_score += val * feat_weight
            total_score += cat_score * config["weight"]

        return np.clip(total_score, 0.0, 1.0)

    def _compute_breakdown(self, features: np.ndarray) -> ScoreBreakdown:
        """Compute per-category score breakdown (each 0-1, sum ~= 1)."""
        feature_dict = dict(zip(FEATURE_NAMES, features))
        breakdown: dict[str, float] = {}

        for category, config in CATEGORY_WEIGHTS.items():
            cat_score = 0.0
            for feat_name, feat_weight in config["features"].items():
                val = float(feature_dict.get(feat_name, 0.0))
                if feat_name == "upi_outflow_ratio":
                    val = max(0, 1.0 - val)
                cat_score += val * feat_weight
            # Weight-normalized contribution
            breakdown[category] = round(cat_score * config["weight"], 4)

        return ScoreBreakdown(**breakdown)

    def _compute_confidence(
        self, features: np.ndarray, data_completeness: float
    ) -> float:
        """Estimate model confidence based on data completeness and feature variance."""
        non_zero_ratio = float(np.count_nonzero(features) / len(features))
        base_confidence = (data_completeness * 0.6 + non_zero_ratio * 0.4)

        if self._is_fitted:
            base_confidence = min(base_confidence + 0.1, 1.0)

        return np.clip(base_confidence, 0.3, 0.99)

    def _get_feature_importance(self, features: np.ndarray) -> dict[str, float]:
        """Return feature importance scores."""
        feature_dict = dict(zip(FEATURE_NAMES, features))
        importance: dict[str, float] = {}

        for category, config in CATEGORY_WEIGHTS.items():
            for feat_name, feat_weight in config["features"].items():
                val = float(feature_dict.get(feat_name, 0.0))
                importance[feat_name] = round(val * feat_weight * config["weight"], 4)

        # Sort by absolute importance
        return dict(sorted(importance.items(), key=lambda x: abs(x[1]), reverse=True))

    def _analyze_factors(
        self, features: np.ndarray
    ) -> tuple[list[str], list[str]]:
        """Identify top positive and negative score factors."""
        feature_dict = dict(zip(FEATURE_NAMES, features))

        FACTOR_DESCRIPTIONS = {
            "upi_inflow_log": "UPI monthly income",
            "upi_outflow_ratio": "UPI spending-to-income ratio",
            "upi_consistency": "UPI transaction consistency",
            "bank_balance_log": "Average bank balance",
            "bank_history_months": "Length of banking history",
            "utility_payment_ratio": "Utility bill payment reliability",
            "loan_repayment": "Loan repayment track record",
            "income_stability": "Income stability",
            "savings_ratio": "Savings-to-income ratio",
            "defi_repayment_ratio": "DeFi loan repayment rate",
            "wallet_age_normalized": "Wallet maturity",
            "wallet_balance_log": "Wallet balance",
            "nft_collateral": "NFT collateral history",
            "dao_participation_normalized": "DAO governance participation",
            "behavior_tokens_normalized": "TrustLedger behavior tokens",
            "defi_loan_count": "DeFi borrowing experience",
        }

        positive: list[tuple[float, str]] = []
        negative: list[tuple[float, str]] = []

        for feat_name, val in feature_dict.items():
            val_f = float(val)
            desc = FACTOR_DESCRIPTIONS.get(feat_name, feat_name)
            if feat_name == "upi_outflow_ratio":
                if val_f < 0.7:
                    positive.append((0.7 - val_f, f"Good {desc}"))
                else:
                    negative.append((val_f - 0.7, f"High {desc}"))
            elif val_f >= 0.6:
                positive.append((val_f, f"Strong {desc}"))
            elif val_f < 0.3:
                negative.append((0.3 - val_f, f"Low {desc}"))

        positive.sort(key=lambda x: x[0], reverse=True)
        negative.sort(key=lambda x: x[0], reverse=True)

        return [p[1] for p in positive], [n[1] for n in negative]

    def _generate_recommendations(
        self, features: np.ndarray, negative_factors: list[str]
    ) -> list[str]:
        """Generate actionable improvement recommendations."""
        feature_dict = dict(zip(FEATURE_NAMES, features))
        recs: list[str] = []

        if float(feature_dict.get("upi_consistency", 0)) < 0.6:
            recs.append("Maintain regular UPI transaction patterns for consistency")
        if float(feature_dict.get("savings_ratio", 0)) < 0.2:
            recs.append("Increase savings by reducing unnecessary UPI outflows")
        if float(feature_dict.get("utility_payment_ratio", 0)) < 0.8:
            recs.append("Pay utility bills on time to boost payment reliability")
        if float(feature_dict.get("defi_repayment_ratio", 0)) < 0.8:
            recs.append("Prioritize repaying DeFi loans to improve on-chain reputation")
        if float(feature_dict.get("behavior_tokens_normalized", 0)) < 0.3:
            recs.append("Earn more TrustLedger behavior tokens through positive actions")
        if float(feature_dict.get("dao_participation_normalized", 0)) < 0.2:
            recs.append("Participate in DAO governance to demonstrate Web3 engagement")
        if float(feature_dict.get("wallet_age_normalized", 0)) < 0.3:
            recs.append("Keep your wallet active over time to build on-chain history")
        if float(feature_dict.get("bank_history_months", 0)) < 0.4:
            recs.append("Maintain a longer banking relationship for better history depth")

        if not recs:
            recs.append("Continue maintaining your current financial habits")

        return recs
