from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class SentimentInsight(BaseModel):
    id: str
    headline: str
    source: str
    timestamp: str
    sentiment_score: int = Field(..., ge=0, le=100)
    ai_conclusion: str


class ReasoningStep(BaseModel):
    step: int
    title: str
    description: str
    status: str


class BrainMetrics(BaseModel):
    articles_analyzed: int
    market_sentiment: str
    is_scanning: bool
    active_sources: int


class AdvisorDiscovery(BaseModel):
    id: str
    text: str
    type: str


class AIAdvisorResponse(BaseModel):
    generated_at: datetime
    asset: str
    action: str
    confidence_score: float = Field(..., ge=0, le=1)
    risk_level: str
    expected_return_label: str
    market_sentiment: str
    recommendation: str
    discoveries: list[AdvisorDiscovery]


class AIInsightsResponse(BaseModel):
    generated_at: datetime
    brain_metrics: BrainMetrics
    sentiment_feed: list[SentimentInsight]
    reasoning_steps: list[ReasoningStep]
