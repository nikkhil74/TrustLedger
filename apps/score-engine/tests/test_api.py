"""Integration tests for the FastAPI endpoints."""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


SAMPLE_PAYLOAD = {
    "user_id": "test-user-1",
    "wallet_address": "0x1234567890abcdef1234567890abcdef12345678",
    "off_chain_data": {
        "upi_avg_monthly_inflow": 45000,
        "upi_avg_monthly_outflow": 32000,
        "upi_consistency_score": 0.85,
        "bank_avg_balance": 125000,
        "bank_months_of_history": 24,
        "utility_bills_paid_on_time": 11,
        "utility_bills_total": 12,
        "loan_repayment_history": 0.95,
        "income_stability_score": 0.78,
    },
    "on_chain_data": {
        "defi_loans_repaid": 3,
        "defi_default_count": 0,
        "wallet_age_days": 365,
        "avg_wallet_balance_usd": 2500,
        "nft_collateral_count": 0,
        "dao_participation_count": 5,
        "behavior_token_balance": 25,
    },
}


@pytest.mark.anyio
async def test_health_endpoint(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "model_loaded" in data
    assert data["version"] == "0.1.0"


@pytest.mark.anyio
async def test_compute_score_endpoint(client: AsyncClient):
    response = await client.post("/score/compute", json=SAMPLE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert 300 <= data["score"] <= 900
    assert 0 <= data["confidence"] <= 1
    assert data["recommendation"] in ("APPROVE", "REVIEW", "DECLINE")
    assert "breakdown" in data
    assert "data_completeness" in data


@pytest.mark.anyio
async def test_explain_score_endpoint(client: AsyncClient):
    response = await client.post("/score/explain", json=SAMPLE_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert 300 <= data["score"] <= 900
    assert "feature_importance" in data
    assert "top_positive_factors" in data
    assert "recommendations" in data


@pytest.mark.anyio
async def test_compute_score_validation_error(client: AsyncClient):
    response = await client.post("/score/compute", json={"user_id": "x"})
    assert response.status_code == 422


@pytest.mark.anyio
async def test_compute_score_negative_values(client: AsyncClient):
    payload = dict(SAMPLE_PAYLOAD)
    payload["off_chain_data"] = {**SAMPLE_PAYLOAD["off_chain_data"], "upi_avg_monthly_inflow": -100}
    response = await client.post("/score/compute", json=payload)
    assert response.status_code == 422
