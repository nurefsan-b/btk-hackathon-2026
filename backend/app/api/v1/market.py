from __future__ import annotations

from datetime import UTC, datetime

import structlog
from fastapi import APIRouter, HTTPException, status
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI

from app.ai.news_fetcher import fetch_financial_news
from app.config import get_settings
from app.schemas.market import AssetResearchResponse, MarketAsset, MarketNewsItem
from app.services.market_price_provider import MarketPriceError, get_market_price

router = APIRouter()
settings = get_settings()
log = structlog.get_logger()

SUPPORTED_MARKET_ASSETS = [
    MarketAsset(symbol="BIST100", name="BIST 100 Index", assetType="index", currency="TRY"),
    MarketAsset(symbol="THYAO.IS", name="Türk Hava Yolları", assetType="equity", currency="TRY"),
    MarketAsset(symbol="ASELS.IS", name="Aselsan", assetType="equity", currency="TRY"),
    MarketAsset(symbol="KCHOL.IS", name="Koç Holding", assetType="equity", currency="TRY"),
    MarketAsset(symbol="SISE.IS", name="Şişecam", assetType="equity", currency="TRY"),
    MarketAsset(symbol="EREGL.IS", name="Ereğli Demir Çelik", assetType="equity", currency="TRY"),
    MarketAsset(symbol="GARAN.IS", name="Garanti BBVA", assetType="equity", currency="TRY"),
    MarketAsset(symbol="AKBNK.IS", name="Akbank", assetType="equity", currency="TRY"),
    MarketAsset(symbol="XAU", name="Gold", assetType="commodity", currency="USD"),
    MarketAsset(symbol="USD", name="US Dollar / TRY", assetType="fx", currency="TRY"),
    MarketAsset(symbol="EUR", name="Euro / TRY", assetType="fx", currency="TRY"),
    MarketAsset(symbol="BTC", name="Bitcoin", assetType="crypto", currency="USD"),
]

NEWS_QUERIES = {
    "BIST100": "BIST100 OR Borsa İstanbul OR Türkiye borsa",
    "THYAO.IS": "THYAO OR Türk Hava Yolları",
    "ASELS.IS": "ASELS OR Aselsan",
    "KCHOL.IS": "KCHOL OR Koç Holding",
    "SISE.IS": "SISE OR Şişecam",
    "EREGL.IS": "EREGL OR Ereğli Demir Çelik",
    "GARAN.IS": "GARAN OR Garanti BBVA",
    "AKBNK.IS": "AKBNK OR Akbank",
    "XAU": "altın OR ons altın OR XAU",
    "USD": "dolar OR USD TRY",
    "EUR": "euro OR EUR TRY",
    "BTC": "bitcoin OR BTC",
}


@router.get("/assets", response_model=list[MarketAsset])
async def list_market_assets() -> list[MarketAsset]:
    return SUPPORTED_MARKET_ASSETS


@router.get("/research/{symbol}", response_model=AssetResearchResponse)
async def research_asset(symbol: str) -> AssetResearchResponse:
    asset = _asset_or_404(symbol)
    try:
        quote = await get_market_price(asset.symbol)
    except MarketPriceError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Market price unavailable for {asset.symbol}",
        ) from exc

    news = [
        _to_news_item(article)
        for article in await fetch_financial_news(NEWS_QUERIES.get(asset.symbol, asset.symbol))
    ]
    sentiment = _news_sentiment(news)
    summary = await _asset_ai_summary(asset, quote.price, quote.change_percent, news, sentiment)
    recommendation = _recommendation(sentiment, quote.change_percent)
    confidence = _confidence(sentiment, quote.change_percent)

    return AssetResearchResponse(
        asset=asset.symbol,
        name=asset.name,
        price=quote.price,
        currency=quote.currency,
        previousClose=quote.previous_close,
        changePercent=quote.change_percent,
        volume=quote.volume,
        news=news,
        aiSummary=summary,
        recommendation=recommendation,
        confidenceScore=confidence,
        riskLevel=_risk_level(asset.symbol, quote.change_percent),
        generatedAt=datetime.now(UTC),
    )


def _asset_or_404(symbol: str) -> MarketAsset:
    normalized = symbol.upper()
    for asset in SUPPORTED_MARKET_ASSETS:
        if asset.symbol.upper() == normalized:
            return asset
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unsupported market asset")


def _to_news_item(article: dict) -> MarketNewsItem:
    return MarketNewsItem(
        title=str(article.get("title") or "Market update"),
        description=str(article.get("description") or ""),
        source=str(article.get("source") or "NewsAPI"),
        publishedAt=str(article.get("published_at") or "Latest"),
    )


async def _asset_ai_summary(
    asset: MarketAsset,
    price: float,
    change_percent: float | None,
    news: list[MarketNewsItem],
    sentiment: int,
) -> str:
    fallback = _local_summary(asset, price, change_percent, sentiment)
    if not settings.google_api_key.strip():
        return fallback

    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.google_api_key,
            temperature=0.2,
            max_retries=1,
        )
        headlines = "\n".join(f"- {item.title}: {item.description}" for item in news[:5])
        response = await llm.ainvoke(
            [
                SystemMessage(
                    content=(
                        "You are a cautious market-analysis assistant for paper trading. "
                        "Do not present this as financial advice. Mention only market signals, "
                        "risk flags, and paper-trade suitability."
                    )
                ),
                HumanMessage(
                    content=(
                        f"Asset: {asset.symbol} ({asset.name})\n"
                        f"Price: {price}\n"
                        f"Daily change percent: {change_percent}\n"
                        f"News sentiment score: {sentiment}/100\n"
                        f"News:\n{headlines}\n"
                        "Write a concise Turkish summary in 2 sentences."
                    )
                ),
            ]
        )
        return str(response.content)
    except Exception as exc:
        log.warning("market.ai_summary_fallback", asset=asset.symbol, error=str(exc))
        return fallback


def _local_summary(
    asset: MarketAsset,
    price: float,
    change_percent: float | None,
    sentiment: int,
) -> str:
    direction = "pozitif" if sentiment >= 60 else "temkinli" if sentiment >= 45 else "zayıf"
    change = f"{change_percent:.2f}%" if change_percent is not None else "n/a"
    return (
        f"{asset.symbol} için haber akışı {direction} görünüyor; son fiyat {price:.2f}, "
        f"günlük değişim {change}. Bu çıktı gerçek emir değil, paper trade için piyasa sinyalidir."
    )


def _news_sentiment(news: list[MarketNewsItem]) -> int:
    if not news:
        return 50
    text = " ".join(f"{item.title} {item.description}".lower() for item in news)
    score = 55
    score += sum(7 for term in ["artış", "yükseliş", "olumlu", "güçlü", "rekor"] if term in text)
    score -= sum(9 for term in ["düşüş", "risk", "negatif", "baskı", "gerile"] if term in text)
    return max(15, min(95, score))


def _recommendation(sentiment: int, change_percent: float | None) -> str:
    change = change_percent or 0
    if sentiment >= 65 and change >= -3:
        return "paper_buy"
    if sentiment < 42 or change < -5:
        return "hold"
    return "watch"


def _confidence(sentiment: int, change_percent: float | None) -> float:
    change_bonus = min(abs(change_percent or 0) / 100, 0.08)
    return round(min(0.92, max(0.35, sentiment / 100 + change_bonus)), 2)


def _risk_level(symbol: str, change_percent: float | None) -> str:
    if symbol == "BTC":
        return "high"
    if abs(change_percent or 0) >= 4:
        return "high"
    if symbol.endswith(".IS") or symbol in {"BIST100", "XAU"}:
        return "medium"
    return "low"
