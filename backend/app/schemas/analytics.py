from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class AnalyticsKPI(BaseModel):
    prediction_accuracy: float
    accuracy_trend: str
    total_roundups: float
    roundups_trend: str
    next_month_forecast: float
    forecast_change: str


class SentimentCorrelationPoint(BaseModel):
    date: str
    sentiment: int
    growth: float


class SpareChangeSource(BaseModel):
    name: str
    value: int
    amount: float
    color: str


class MarketAlert(BaseModel):
    id: str
    type: str
    message: str
    timestamp: str


class AnalyticsResponse(BaseModel):
    generated_at: datetime
    kpis: AnalyticsKPI
    sentiment_correlation: list[SentimentCorrelationPoint]
    spare_change_sources: list[SpareChangeSource]
    market_alerts: list[MarketAlert]
