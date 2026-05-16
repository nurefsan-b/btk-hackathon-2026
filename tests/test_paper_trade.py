from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.services.market_price_provider import MarketPrice


@pytest.mark.asyncio
async def test_create_user_selected_paper_trade(client: AsyncClient):
    await client.post(
        "/api/v1/transactions/",
        json={
            "user_id": "paper_user",
            "amount": 135.0,
            "merchant": "Starbucks",
            "currency": "TRY",
        },
    )

    with patch(
        "app.services.trading_service.get_market_price",
        new=AsyncMock(
            return_value=MarketPrice(
                asset="THYAO.IS",
                symbol="THYAO.IS",
                price=312.4,
                currency="TRY",
                source="test",
                fetched_at=datetime.now(UTC),
            )
        ),
    ):
        response = await client.post(
            "/api/v1/trades/paper",
            json={
                "user_id": "paper_user",
                "asset": "THYAO.IS",
                "reasoning": "User selected THYAO.IS after reviewing AI market analysis.",
            },
        )

    assert response.status_code == 201
    data = response.json()
    assert data["asset"] == "THYAO.IS"
    assert data["status"] == "paper"
    assert data["executed_price"] == pytest.approx(312.4)
    assert data["amount_invested"] == pytest.approx(5.0)


@pytest.mark.asyncio
async def test_create_paper_trade_requires_pending_savings(client: AsyncClient):
    response = await client.post(
        "/api/v1/trades/paper",
        json={
            "user_id": "empty_paper_user",
            "asset": "ASELS.IS",
            "reasoning": "User selected ASELS.IS after reviewing AI market analysis.",
        },
    )

    assert response.status_code == 400
