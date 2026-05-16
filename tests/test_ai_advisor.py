from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_ai_advisor_uses_supported_asset_universe(client: AsyncClient):
    await client.post(
        "/api/v1/transactions/",
        json={
            "user_id": "advisor_user",
            "amount": 135.0,
            "merchant": "Starbucks",
            "currency": "TRY",
        },
    )

    with patch(
        "app.api.v1.ai.fetch_financial_news",
        new=AsyncMock(
            return_value=[
                {
                    "title": "Altın piyasasında güçlü yükseliş",
                    "description": "XAU için olumlu görünüm korunuyor.",
                    "source": "Test News",
                    "published_at": "Latest",
                }
            ]
        ),
    ):
        response = await client.get("/api/v1/ai/advisor/advisor_user")

    assert response.status_code == 200
    data = response.json()
    assert data["asset"] == "XAU"
    assert data["action"] == "hold"
    assert "Technology Fund" not in data["recommendation"]
    assert all(
        asset in ", ".join(item["text"] for item in data["discoveries"])
        for asset in ["BIST100", "XAU", "USD", "EUR", "BTC"]
    )
