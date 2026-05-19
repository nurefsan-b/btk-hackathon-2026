from __future__ import annotations

import asyncio
import json
import random

import structlog
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.ai.news_fetcher import fetch_financial_news
from app.ai.price_fetcher import fetch_market_data
from app.ai.schemas import TradeDecision
from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

# Hard timeout for the entire Gemini call (seconds).
# Without this, the LangChain/httpx call blocks indefinitely when the
# Google API is unreachable from this network.
_GEMINI_TIMEOUT_SECONDS = 25

_SYSTEM_PROMPT = """\
You are an expert algorithmic trading agent specializing in Turkish financial markets.
Your job is to analyze financial news and make a structured investment decision.

RULES:
- Base your decision ONLY on the provided news headlines.
- Your action MUST be one of: "buy", "sell", or "hold".
- asset MUST be one of: "BIST100", "XAU" (gold), "USD", "EUR", "BTC".
- confidence_score MUST be between 0.0 and 1.0.
- reasoning MUST explain WHY you chose this action based on the news.
- Return ONLY valid JSON matching the required schema — no extra text.

{format_instructions}
"""

_USER_PROMPT = """\
MARKET STATUS (Current Prices & 24h Change):
{market_data}

LATEST FINANCIAL NEWS HEADLINES:
{news_summary}

Based on the market momentum and the news headlines above, what is your trading decision? 
If a news item is very positive but the asset is already up significantly, consider if it's a "buy" or "hold". 
Explain your reasoning clearly.
"""


def _build_chain() -> tuple[ChatGoogleGenerativeAI, ChatPromptTemplate, PydanticOutputParser]:  # type: ignore[return-value]
    llm = ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=0.1,  # Low temp for deterministic financial decisions
        max_retries=1,    # Reduced from 2 — we already have tenacity retries
        request_timeout=20,
    )
    parser: PydanticOutputParser[TradeDecision] = PydanticOutputParser(
        pydantic_object=TradeDecision
    )
    prompt = ChatPromptTemplate.from_messages([
        ("system", _SYSTEM_PROMPT),
        ("human", _USER_PROMPT),
    ])
    return llm, prompt, parser


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=8),
    reraise=True,
)
async def _call_gemini(
    news_summary: str,
    market_summary: str,
) -> TradeDecision:
    """
    Call Gemini with a hard asyncio timeout so the task never hangs indefinitely.
    """
    llm, prompt, parser = _build_chain()
    chain = prompt | llm | parser

    log.info("agent.invoking", model=settings.gemini_model)
    decision: TradeDecision = await asyncio.wait_for(
        chain.ainvoke(
            {
                "format_instructions": parser.get_format_instructions(),
                "news_summary": news_summary,
                "market_data": market_summary,
            }
        ),
        timeout=_GEMINI_TIMEOUT_SECONDS,
    )
    log.info(
        "agent.decision",
        action=decision.action,
        asset=decision.asset,
        confidence=decision.confidence_score,
    )
    return decision


async def run_trading_agent() -> TradeDecision:
    """
    Fetch news + market data, then run the Gemini agent.

    Resilience strategy:
      1. Try Gemini with a hard 25-second timeout (2 attempts via tenacity)
      2. On any failure (timeout, API error, parse error) → fall through to
         the smart deterministic fallback which uses real sentiment signals
         from the already-fetched news and market data.
    """
    news_articles = await fetch_financial_news()
    market_data = await fetch_market_data()

    news_summary = "\n".join(
        f"- {a['title']}: {a['description']}" for a in news_articles
    )
    market_summary = "\n".join(
        f"- {asset}: ${info['price']:.2f} ({info['change_24h']:+.2f}%)"
        for asset, info in market_data.items()
    )

    # ── Attempt 1: Real Gemini call ───────────────────────────────────────────
    try:
        return await _call_gemini(news_summary, market_summary)
    except Exception as exc:
        log.warning(
            "agent.gemini_unavailable",
            error=type(exc).__name__,
            detail=str(exc)[:200],
            msg="Falling back to deterministic sentiment engine",
        )

    # ── Attempt 2: Smart deterministic fallback ───────────────────────────────
    return _deterministic_fallback(news_articles, market_data)


# ─── Deterministic fallback ──────────────────────────────────────────────────

_POSITIVE_TERMS = (
    "artış", "büyüme", "iyileş", "olumlu", "rekor", "yükseliş",
    "güçlü", "kazanç", "rally", "positive", "growth",
)
_NEGATIVE_TERMS = (
    "düşüş", "gerile", "risk", "resesyon", "kayb", "negatif",
    "baskı", "sert", "crash", "crisis", "kriz",
)
_ASSET_KEYWORDS: dict[str, list[str]] = {
    "BTC":    ["bitcoin", "btc", "kripto", "crypto"],
    "XAU":    ["altın", "gold", "xau", "ons"],
    "USD":    ["dolar", "usd", "dollar"],
    "EUR":    ["euro", "eur"],
    "BIST100": ["borsa", "bist", "hisse", "endeks", "xu100"],
}


def _deterministic_fallback(
    articles: list[dict],
    market_data: dict,
) -> TradeDecision:
    """
    Rule-based trading decision derived from news sentiment and price momentum.
    Always produces a valid TradeDecision even with zero network access.
    """
    # Score sentiment from headlines
    positive_hits = 0
    negative_hits = 0
    asset_mentions: dict[str, int] = {a: 0 for a in _ASSET_KEYWORDS}

    for article in articles:
        text = f"{article.get('title', '')} {article.get('description', '')}".lower()
        positive_hits += sum(1 for t in _POSITIVE_TERMS if t in text)
        negative_hits += sum(1 for t in _NEGATIVE_TERMS if t in text)
        for asset, keywords in _ASSET_KEYWORDS.items():
            if any(k in text for k in keywords):
                asset_mentions[asset] += 1

    sentiment_score = positive_hits - negative_hits  # can be negative

    # Pick most-mentioned asset; default to BIST100
    top_asset = max(asset_mentions, key=lambda a: (asset_mentions[a], a == "BIST100"))
    if asset_mentions[top_asset] == 0:
        top_asset = "BIST100"

    # Factor in 24h price momentum for the chosen asset
    momentum = market_data.get(top_asset, {}).get("change_24h", 0.0)

    # Decision logic
    if sentiment_score >= 2 or momentum > 1.5:
        action = "buy"
        confidence = round(min(0.85, 0.60 + (sentiment_score * 0.04) + (momentum * 0.01)), 2)
    elif sentiment_score <= -2 or momentum < -1.5:
        action = "sell"
        confidence = round(min(0.80, 0.55 + (abs(sentiment_score) * 0.04)), 2)
    else:
        action = "hold"
        confidence = 0.55

    # Clamp confidence to valid range
    confidence = round(max(0.45, min(0.90, confidence)), 2)

    reasoning_parts = [
        f"Gelişmiş Deterministik Karar Motoru aktif: Sinyaller Gemini olmadan yerel ağda çözümlendi.",
        f"Duygu Analizi (NLP): {positive_hits} olumlu, {negative_hits} olumsuz haber sinyali.",
        f"Trend Hacmi: {top_asset} {asset_mentions[top_asset]} kez anıldı.",
        f"24s Fiyat Momentumu: {momentum:+.2f}%.",
        f"Nihai Otonom Karar: {action.upper()} (Güven Skoru: {confidence:.0%}).",
    ]

    return TradeDecision(
        action=action,
        asset=top_asset,
        confidence_score=confidence,
        reasoning=" ".join(reasoning_parts),
    )
