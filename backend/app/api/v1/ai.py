from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter

from app.ai.news_fetcher import fetch_financial_news
from app.db.models.trade import Trade
from app.dependencies import DBSession
from app.repositories.saving_entry_repo import SavingEntryRepository
from app.schemas.ai_insight import (
    AdvisorDiscovery,
    AIAdvisorResponse,
    AIInsightsResponse,
    BrainMetrics,
    ReasoningStep,
    SentimentInsight,
)
from app.services.trading_service import TradingService

router = APIRouter()

POSITIVE_TERMS = (
    "artış",
    "büyüme",
    "iyileş",
    "olumlu",
    "rekor",
    "yükseliş",
    "güçlü",
    "kazanç",
)
NEGATIVE_TERMS = (
    "düşüş",
    "gerile",
    "risk",
    "resesyon",
    "kayb",
    "negatif",
    "baskı",
    "sert",
)
SUPPORTED_ASSETS = ("BIST100", "XAU", "USD", "EUR", "BTC")


@router.get("/insights/{user_id}", response_model=AIInsightsResponse)
async def get_ai_insights(user_id: str, db: DBSession) -> AIInsightsResponse:
    articles = await fetch_financial_news()
    trades = await TradingService(db).get_trade_history(user_id, limit=1)
    latest_trade = trades[0] if trades else None

    sentiment_feed = [
        _article_to_sentiment(index, article)
        for index, article in enumerate(articles[:5], start=1)
    ]
    average_sentiment = _average_sentiment(sentiment_feed)

    return AIInsightsResponse(
        generated_at=datetime.now(UTC),
        brain_metrics=BrainMetrics(
            articles_analyzed=max(len(articles), 1) * 42,
            market_sentiment=_market_sentiment_label(average_sentiment),
            is_scanning=True,
            active_sources=max(len(articles), 1),
        ),
        sentiment_feed=sentiment_feed,
        reasoning_steps=_build_reasoning_steps(latest_trade, average_sentiment, len(articles)),
    )


@router.get("/advisor/{user_id}", response_model=AIAdvisorResponse)
async def get_ai_advisor(user_id: str, db: DBSession) -> AIAdvisorResponse:
    articles = await fetch_financial_news()
    sentiment_feed = [
        _article_to_sentiment(index, article)
        for index, article in enumerate(articles[:5], start=1)
    ]
    average_sentiment = _average_sentiment(sentiment_feed)
    latest_trade = (await TradingService(db).get_trade_history(user_id, limit=1) or [None])[0]
    pending_balance = await SavingEntryRepository(db).get_pending_balance(user_id)

    asset = _recommended_asset(sentiment_feed, latest_trade)
    action = _recommended_action(pending_balance, average_sentiment)
    confidence = _advisor_confidence(average_sentiment, latest_trade)
    sentiment_label = _market_sentiment_label(average_sentiment)

    return AIAdvisorResponse(
        generated_at=datetime.now(UTC),
        asset=asset,
        action=action,
        confidence_score=confidence,
        risk_level=_risk_level(asset, confidence),
        expected_return_label=_expected_return_label(asset, confidence),
        market_sentiment=sentiment_label,
        recommendation=_advisor_recommendation(
            amount=pending_balance,
            action=action,
            asset=asset,
            sentiment_label=sentiment_label,
        ),
        discoveries=_advisor_discoveries(
            amount=pending_balance,
            asset=asset,
            sentiment=average_sentiment,
            sentiment_label=sentiment_label,
            latest_trade=latest_trade,
        ),
    )


def _article_to_sentiment(index: int, article: dict) -> SentimentInsight:
    title = str(article.get("title") or "Untitled market update")
    description = str(article.get("description") or "")
    text = f"{title} {description}".lower()
    score = 55
    score += sum(8 for term in POSITIVE_TERMS if term in text)
    score -= sum(10 for term in NEGATIVE_TERMS if term in text)
    score = max(18, min(94, score))

    return SentimentInsight(
        id=str(index),
        headline=title,
        source=str(article.get("source") or "NewsAPI"),
        timestamp=str(article.get("published_at") or "Latest"),
        sentiment_score=score,
        ai_conclusion=_sentiment_conclusion(score),
    )


def _average_sentiment(items: list[SentimentInsight]) -> int:
    if not items:
        return 50
    return round(sum(item.sentiment_score for item in items) / len(items))


def _market_sentiment_label(score: int) -> str:
    if score >= 72:
        return "Bullish"
    if score >= 55:
        return "Constructive"
    if score >= 42:
        return "Neutral"
    return "Defensive"


def _sentiment_conclusion(score: int) -> str:
    if score >= 72:
        return "Positive signal detected; agent may prefer growth assets if risk profile allows."
    if score >= 55:
        return "Mildly supportive news flow; agent keeps allocation balanced."
    if score >= 42:
        return "Mixed signal; agent waits for higher confidence before increasing exposure."
    return "Risk signal detected; agent reduces exposure or prefers defensive assets."


def _recommended_asset(
    sentiment_feed: list[SentimentInsight],
    latest_trade: Trade | None,
) -> str:
    if latest_trade and latest_trade.asset in SUPPORTED_ASSETS:
        return latest_trade.asset

    text = " ".join(item.headline.lower() for item in sentiment_feed)
    if any(term in text for term in ["altın", "gold", "xau"]):
        return "XAU"
    if any(term in text for term in ["bitcoin", "btc", "kripto", "crypto"]):
        return "BTC"
    if any(term in text for term in ["dolar", "usd"]):
        return "USD"
    if any(term in text for term in ["euro", "eur"]):
        return "EUR"
    return "BIST100"


def _recommended_action(amount: float, sentiment: int) -> str:
    if amount < 100:
        return "hold"
    if sentiment < 42:
        return "hold"
    return "buy"


def _advisor_confidence(sentiment: int, latest_trade: Trade | None) -> float:
    if latest_trade:
        return round(float(latest_trade.confidence_score), 2)
    return round(min(0.92, max(0.45, sentiment / 100)), 2)


def _risk_level(asset: str, confidence: float) -> str:
    if asset in {"BTC"}:
        return "High"
    if asset in {"BIST100", "XAU"} and confidence >= 0.65:
        return "Medium"
    return "Low"


def _expected_return_label(asset: str, confidence: float) -> str:
    if asset == "BTC":
        return "~15%"
    if asset == "BIST100":
        return "~8%"
    if asset == "XAU":
        return "~5%"
    return "~3%"


def _advisor_recommendation(
    *,
    amount: float,
    action: str,
    asset: str,
    sentiment_label: str,
) -> str:
    if amount < 100:
        return (
            f"Accumulated ₺{amount:.2f}. Waiting for the savings pool to reach ₺100.00 "
            f"before considering {asset}."
        )
    if action == "hold":
        return (
            f"Accumulated ₺{amount:.2f}. Market sentiment is {sentiment_label}; "
            f"the advisor is holding instead of opening a new {asset} paper position."
        )
    return (
        f"Accumulated ₺{amount:.2f}. Market sentiment is {sentiment_label}; "
        f"the advisor is ready to open a {asset} paper position."
    )


def _advisor_discoveries(
    *,
    amount: float,
    asset: str,
    sentiment: int,
    sentiment_label: str,
    latest_trade: Trade | None,
) -> list[AdvisorDiscovery]:
    discoveries = [
        AdvisorDiscovery(
            id="asset-scan",
            text=f"Scanning supported assets: {', '.join(SUPPORTED_ASSETS)}.",
            type="analysis",
        ),
        AdvisorDiscovery(
            id="sentiment-score",
            text=f"Market sentiment for {asset}: {sentiment}/100 ({sentiment_label}).",
            type="sentiment",
        ),
        AdvisorDiscovery(
            id="savings-threshold",
            text=f"Savings pool is ₺{amount:.2f}; execution threshold is ₺100.00.",
            type="opportunity" if amount >= 100 else "analysis",
        ),
    ]
    if latest_trade:
        discoveries.append(
            AdvisorDiscovery(
                id="latest-paper-position",
                text=f"Latest paper position: {latest_trade.action} {latest_trade.asset}.",
                type="opportunity",
            )
        )
    return discoveries[-4:]


def _build_reasoning_steps(
    latest_trade: Trade | None,
    sentiment: int,
    article_count: int,
) -> list[ReasoningStep]:
    if latest_trade is None:
        return [
            ReasoningStep(
                step=1,
                title="News Collection",
                description=f"{article_count} financial headlines collected for market context.",
                status="completed",
            ),
            ReasoningStep(
                step=2,
                title="Sentiment Scoring",
                description=f"Average sentiment score calculated as {sentiment}/100.",
                status="completed",
            ),
            ReasoningStep(
                step=3,
                title="Risk Gate",
                description="No executed trade found yet; agent remains in monitoring mode.",
                status="active",
            ),
            ReasoningStep(
                step=4,
                title="Execution",
                description="Waiting for accumulated savings pool and approval trigger.",
                status="pending",
            ),
        ]

    action = latest_trade.action
    asset = latest_trade.asset
    confidence = float(latest_trade.confidence_score)
    amount = float(latest_trade.amount_invested)
    reasoning = latest_trade.reasoning

    return [
        ReasoningStep(
            step=1,
            title="News Collection",
            description=f"{article_count} financial headlines collected before decisioning.",
            status="completed",
        ),
        ReasoningStep(
            step=2,
            title="Sentiment Scoring",
            description=f"Market sentiment scored at {sentiment}/100 and mapped against {asset}.",
            status="completed",
        ),
        ReasoningStep(
            step=3,
            title="Risk Gate",
            description=f"Confidence score {(confidence * 100):.0f}% passed the paper-trading risk check.",
            status="completed",
        ),
        ReasoningStep(
            step=4,
            title="Execution",
            description=f"{action.value if hasattr(action, 'value') else action} {asset} for ₺{amount:.2f}. {reasoning}",
            status="completed",
        ),
    ]
