from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_analytics_endpoint_uses_backend_data(client: AsyncClient):
    await client.post(
        "/api/v1/transactions/",
        json={
            "user_id": "analytics_user",
            "amount": 135.0,
            "merchant": "Starbucks",
            "currency": "TRY",
        },
    )
    await client.post(
        "/api/v1/transactions/",
        json={
            "user_id": "analytics_user",
            "amount": 67.5,
            "merchant": "Metro Card",
            "currency": "TRY",
        },
    )

    with patch(
        "app.api.v1.analytics.fetch_financial_news",
        new=AsyncMock(
            return_value=[
                {
                    "title": "BIST100 yükseliş sinyali verdi",
                    "description": "Piyasalarda olumlu hava güçlü.",
                    "source": "Test News",
                    "published_at": "Latest",
                }
            ]
        ),
    ):
        response = await client.get("/api/v1/analytics/analytics_user")

    assert response.status_code == 200
    data = response.json()
    assert data["kpis"]["total_roundups"] == pytest.approx(7.5)
    assert data["kpis"]["next_month_forecast"] > 0
    assert data["spare_change_sources"][0]["amount"] == pytest.approx(5.0)
    assert data["market_alerts"][0]["type"] == "positive"
