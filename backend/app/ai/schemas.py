from __future__ import annotations

from pydantic import BaseModel, Field


class TradeDecision(BaseModel):
    """
    Strict structured output from the Gemini trading agent.
    LangChain PydanticOutputParser enforces this schema.
    """

    action: str = Field(
        ...,
        description="Trade action: must be one of 'buy', 'sell', or 'hold'",
    )
    asset: str = Field(
        ...,
        description="Asset ticker or name (e.g. 'BIST100', 'XAU', 'USD', 'BTC')",
    )
    confidence_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Agent confidence in this decision (0.0 = no confidence, 1.0 = fully confident)",
    )
    reasoning: str = Field(
        ...,
        min_length=20,
        description="Detailed reasoning based on news analysis. Must be at least 20 chars.",
    )
