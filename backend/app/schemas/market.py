from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class MarketAsset(BaseModel):
    symbol: str
    name: str
    asset_type: str = Field(alias="assetType")
    currency: str

    model_config = ConfigDict(populate_by_name=True)


class MarketNewsItem(BaseModel):
    title: str
    description: str
    source: str
    published_at: str = Field(alias="publishedAt")

    model_config = ConfigDict(populate_by_name=True)


class AssetResearchResponse(BaseModel):
    asset: str
    name: str
    price: float
    currency: str
    previous_close: float | None = Field(alias="previousClose")
    change_percent: float | None = Field(alias="changePercent")
    volume: int | None
    news: list[MarketNewsItem]
    ai_summary: str = Field(alias="aiSummary")
    recommendation: str
    confidence_score: float = Field(alias="confidenceScore")
    risk_level: str = Field(alias="riskLevel")
    generated_at: datetime = Field(alias="generatedAt")

    model_config = ConfigDict(populate_by_name=True)
