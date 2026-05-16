from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.services.market_price_provider import MarketPrice


@pytest.mark.asyncio
async def test_market_assets_lists_supported_symbols(client: AsyncClient):
    response = await client.get("/api/v1/market/assets")

    assert response.status_code == 200
    symbols = {asset["symbol"] for asset in response.json()}
    assert {"BIST100", "THYAO.IS", "ASELS.IS", "XAU", "BTC"}.issubset(symbols)


@pytest.mark.asyncio
async def test_market_research_returns_quote_news_and_ai_summary(client: AsyncClient):
    with (
        patch(
            "app.api.v1.market.get_market_price",
            new=AsyncMock(
                return_value=MarketPrice(
                    asset="THYAO.IS",
                    symbol="THYAO.IS",
                    price=312.4,
                    currency="TRY",
                    source="test",
                    fetched_at=datetime.now(UTC),
                    previous_close=300.0,
                    change_percent=4.13,
                    volume=123456,
                )
            ),
        ),
        patch(
            "app.api.v1.market.fetch_financial_news",
            new=AsyncMock(
                return_value=[
                    {
                        "title": "THYAO güçlü yükseliş gösterdi",
                        "description": "Türk Hava Yolları için olumlu beklentiler arttı.",
                        "source": "Test News",
                        "published_at": "Latest",
                    }
                ]
            ),
        ),
        patch(
            "app.api.v1.market._asset_ai_summary",
            new=AsyncMock(return_value="THYAO için paper trade sinyali pozitif."),
        ),
    ):
        response = await client.get("/api/v1/market/research/THYAO.IS")

    assert response.status_code == 200
    data = response.json()
    assert data["asset"] == "THYAO.IS"
    assert data["price"] == pytest.approx(312.4)
    assert data["changePercent"] == pytest.approx(4.13)
    assert data["aiSummary"] == "THYAO için paper trade sinyali pozitif."
    assert data["recommendation"] == "paper_buy"
