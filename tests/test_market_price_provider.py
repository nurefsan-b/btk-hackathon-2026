from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest

from app.ai.schemas import TradeDecision
from app.db.models.trade import TradeStatus
from app.services.market_price_provider import YahooMarketPriceProvider
from app.services.trading_service import TradingService


def test_yahoo_provider_parses_regular_market_price():
    provider = YahooMarketPriceProvider()

    price = provider._parse_price(
        "XU100.IS",
        {
            "chart": {
                "result": [
                    {
                        "meta": {
                            "regularMarketPrice": 10420.55,
                            "currency": "TRY",
                        }
                    }
                ]
            }
        },
    )

    assert price.asset == "BIST100"
    assert price.symbol == "XU100.IS"
    assert price.price == pytest.approx(10420.55)
    assert price.source == "yahoo"


def test_yahoo_provider_falls_back_to_latest_close():
    provider = YahooMarketPriceProvider()

    price = provider._parse_price(
        "BTC-USD",
        {
            "chart": {
                "result": [
                    {
                        "meta": {"currency": "USD"},
                        "indicators": {
                            "quote": [
                                {"close": [None, 63000.0, None, 64125.25]}
                            ]
                        },
                    }
                ]
            }
        },
    )

    assert price.asset == "BTC"
    assert price.price == pytest.approx(64125.25)
    assert price.currency == "USD"


@pytest.mark.asyncio
async def test_trading_service_uses_market_price_provider(db_session):
    decision = TradeDecision(
        action="buy",
        asset="BIST100",
        confidence_score=0.8,
        reasoning="Positive market signal.",
    )

    with patch(
        "app.services.trading_service.get_market_price",
        new=AsyncMock(
            return_value=type(
                "Quote",
                (),
                {"price": 12345.67, "source": "test_provider"},
            )()
        ),
    ):
        trade = await TradingService(db_session).execute_trade_decision(
            user_id="price_provider_user",
            decision=decision,
            amount=50.0,
            debit_savings=False,
        )

    assert float(trade.executed_price) == pytest.approx(12345.67)
    assert trade.status == TradeStatus.SIMULATED
