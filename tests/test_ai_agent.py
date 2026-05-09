from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, patch

from app.ai.schemas import TradeDecision


@pytest.mark.asyncio
class TestAIAgent:
    async def test_trade_decision_schema_valid(self):
        decision = TradeDecision(
            action="buy",
            asset="BIST100",
            confidence_score=0.85,
            reasoning="Güçlü ekonomik veriler ve merkez bankası kararı alımı destekliyor.",
        )
        assert decision.action == "buy"
        assert decision.confidence_score == 0.85

    async def test_trade_decision_invalid_confidence(self):
        with pytest.raises(Exception):
            TradeDecision(
                action="buy",
                asset="BIST100",
                confidence_score=1.5,  # > 1.0 should fail
                reasoning="Test reasoning text here for validation.",
            )

    @patch("app.ai.agent.run_trading_agent", new_callable=AsyncMock)
    async def test_mock_agent_response(self, mock_agent):
        mock_agent.return_value = TradeDecision(
            action="hold",
            asset="XAU",
            confidence_score=0.6,
            reasoning="Belirsiz piyasa koşulları nedeniyle bekle ve gör stratejisi.",
        )
        from app.ai.agent import run_trading_agent
        result = await run_trading_agent()
        assert result.action == "hold"
        assert result.asset == "XAU"
