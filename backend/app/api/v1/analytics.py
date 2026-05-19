from __future__ import annotations

from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.api.v1.auth import get_current_user
from app.ai.news_fetcher import fetch_financial_news
from app.db.models.trade import Trade
from app.db.models.transaction import BankTransaction
from app.dependencies import DBSession
from app.schemas.auth import UserResponse
from app.schemas.analytics import (
    AnalyticsKPI,
    AnalyticsResponse,
    MarketAlert,
    SentimentCorrelationPoint,
    SpareChangeSource,
)

router = APIRouter()

SOURCE_COLORS = ["#00ff88", "#8b5cf6", "#6366f1", "#14b8a6", "#f59e0b"]
POSITIVE_TERMS = ("artış", "büyüme", "olumlu", "rekor", "yükseliş", "güçlü", "kazanç")
NEGATIVE_TERMS = ("düşüş", "gerile", "risk", "resesyon", "kayb", "negatif", "baskı")


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    db: DBSession,
    current_user: UserResponse = Depends(get_current_user),
) -> AnalyticsResponse:
    transactions = await _list_transactions(db, str(current_user.id))
    trades = await _list_trades(db, str(current_user.id))
    articles = await fetch_financial_news()
    sentiment = _average_sentiment(articles)

    return AnalyticsResponse(
        generated_at=datetime.now(UTC),
        kpis=_build_kpis(transactions, trades),
        sentiment_correlation=_build_sentiment_correlation(transactions, trades, sentiment),
        spare_change_sources=_build_spare_change_sources(transactions),
        market_alerts=_build_market_alerts(articles, trades),
    )


async def _list_transactions(db: DBSession, user_id: str) -> list[BankTransaction]:
    result = await db.execute(
        select(BankTransaction)
        .where(BankTransaction.user_id == user_id)
        .order_by(BankTransaction.created_at.desc())
    )
    return list(result.scalars().all())


async def _list_trades(db: DBSession, user_id: str) -> list[Trade]:
    result = await db.execute(
        select(Trade)
        .where(Trade.user_id == user_id)
        .order_by(Trade.created_at.desc())
    )
    return list(result.scalars().all())


def _build_kpis(transactions: list[BankTransaction], trades: list[Trade]) -> AnalyticsKPI:
    now = datetime.now(UTC)
    current_start = now - timedelta(days=30)
    previous_start = now - timedelta(days=60)

    total_roundups = round(sum(float(tx.round_up_diff) for tx in transactions), 2)
    current_roundups = sum(
        float(tx.round_up_diff) for tx in transactions if _as_utc(tx.created_at) >= current_start
    )
    previous_roundups = sum(
        float(tx.round_up_diff)
        for tx in transactions
        if previous_start <= _as_utc(tx.created_at) < current_start
    )

    profitable = [trade for trade in trades if trade.profit_loss is not None]
    prediction_accuracy = (
        round(
            sum(1 for trade in profitable if float(trade.profit_loss) >= 0)
            / len(profitable)
            * 100,
            1,
        )
        if profitable
        else 0.0
    )

    daily_average = current_roundups / 30 if current_roundups > 0 else total_roundups / 30
    next_month_forecast = round(daily_average * 30, 2)

    return AnalyticsKPI(
        prediction_accuracy=prediction_accuracy,
        accuracy_trend=_signed_percent(_trade_accuracy_trend(trades)),
        total_roundups=total_roundups,
        roundups_trend=_signed_lira(current_roundups - previous_roundups),
        next_month_forecast=next_month_forecast,
        forecast_change=_signed_percent(_percentage_change(current_roundups, previous_roundups)),
    )


def _build_sentiment_correlation(
    transactions: list[BankTransaction],
    trades: list[Trade],
    average_sentiment: int,
) -> list[SentimentCorrelationPoint]:
    now = datetime.now(UTC).date()
    points: list[SentimentCorrelationPoint] = []
    total_invested = sum(float(trade.amount_invested) for trade in trades) or 1.0

    for days_ago in [25, 20, 15, 10, 5, 0]:
        day = now - timedelta(days=days_ago)
        cumulative_profit = sum(
            float(trade.profit_loss or 0)
            for trade in trades
            if _as_utc(trade.created_at).date() <= day
        )
        day_roundups = sum(
            float(tx.round_up_diff) for tx in transactions if _as_utc(tx.created_at).date() == day
        )
        growth = round((cumulative_profit / total_invested) * 100, 2)
        sentiment = max(0, min(100, round(average_sentiment + min(day_roundups, 10))))
        points.append(
            SentimentCorrelationPoint(
                date=day.strftime("%b %d"),
                sentiment=sentiment,
                growth=growth,
            )
        )

    return points


def _build_spare_change_sources(transactions: list[BankTransaction]) -> list[SpareChangeSource]:
    totals: dict[str, float] = defaultdict(float)
    for tx in transactions:
        totals[_category_from_merchant(tx.merchant or tx.description or "Other")] += float(
            tx.round_up_diff
        )

    total_amount = sum(totals.values())
    if total_amount <= 0:
        return []

    sources = []
    for index, (name, amount) in enumerate(sorted(totals.items(), key=lambda item: item[1], reverse=True)):
        sources.append(
            SpareChangeSource(
                name=name,
                value=round((amount / total_amount) * 100),
                amount=round(amount, 2),
                color=SOURCE_COLORS[index % len(SOURCE_COLORS)],
            )
        )
    return sources


def _build_market_alerts(articles: list[dict], trades: list[Trade]) -> list[MarketAlert]:
    alerts: list[MarketAlert] = []

    for index, article in enumerate(articles[:3], start=1):
        score = _sentiment_score(article)
        alert_type = "positive" if score >= 65 else "warning" if score < 45 else "neutral"
        title = str(article.get("title") or "Market update")
        alerts.append(
            MarketAlert(
                id=f"news-{index}",
                type=alert_type,
                message=f"{title} Sentiment score: {score}/100.",
                timestamp=str(article.get("published_at") or "Latest"),
            )
        )

    for trade in trades[:2]:
        profit_loss = float(trade.profit_loss or 0)
        alert_type = "positive" if profit_loss >= 0 else "warning"
        alerts.append(
            MarketAlert(
                id=f"trade-{trade.id}",
                type=alert_type,
                message=(
                    f"{trade.asset} paper position is "
                    f"{'up' if profit_loss >= 0 else 'down'} ₺{abs(profit_loss):.2f}."
                ),
                timestamp=_as_utc(trade.created_at).strftime("%b %d"),
            )
        )

    return alerts


def _average_sentiment(articles: list[dict]) -> int:
    if not articles:
        return 50
    return round(sum(_sentiment_score(article) for article in articles) / len(articles))


def _sentiment_score(article: dict) -> int:
    text = f"{article.get('title') or ''} {article.get('description') or ''}".lower()
    score = 55
    score += sum(8 for term in POSITIVE_TERMS if term in text)
    score -= sum(10 for term in NEGATIVE_TERMS if term in text)
    return max(18, min(94, score))


def _category_from_merchant(merchant: str) -> str:
    name = merchant.lower()
    if any(key in name for key in ["starbucks", "mcdonald", "restaurant", "coffee", "vapiano"]):
        return "Food & Dining"
    if any(key in name for key in ["metro", "ulaşım", "akaryakıt"]):
        return "Transportation"
    if any(key in name for key in ["netflix", "spotify"]):
        return "Entertainment"
    if any(key in name for key in ["migros", "a101", "bim", "şok", "trendyol", "hepsiburada", "teknosa"]):
        return "Shopping"
    return "Other"


def _trade_accuracy_trend(trades: list[Trade]) -> float:
    recent = [trade for trade in trades[:5] if trade.profit_loss is not None]
    older = [trade for trade in trades[5:10] if trade.profit_loss is not None]
    if not recent or not older:
        return 0.0
    recent_accuracy = sum(1 for trade in recent if float(trade.profit_loss) >= 0) / len(recent)
    older_accuracy = sum(1 for trade in older if float(trade.profit_loss) >= 0) / len(older)
    return round((recent_accuracy - older_accuracy) * 100, 1)


def _percentage_change(current: float, previous: float) -> float:
    if previous <= 0:
        return 0.0 if current <= 0 else 100.0
    return round(((current - previous) / previous) * 100, 1)


def _signed_percent(value: float) -> str:
    sign = "+" if value >= 0 else ""
    return f"{sign}{value:.1f}%"


def _signed_lira(value: float) -> str:
    sign = "+" if value >= 0 else "-"
    return f"{sign}₺{abs(value):.2f}"


def _as_utc(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)
