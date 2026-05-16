from __future__ import annotations

import asyncio
import json

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
        max_retries=2,
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
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=15),
    reraise=True,
)
async def run_trading_agent() -> TradeDecision:
    """
    Fetch news, run Gemini agent, return a strictly typed TradeDecision.
    Retries up to 3 times on parse/network failure.
    """
    llm, prompt, parser = _build_chain()

    news_articles = await fetch_financial_news()
    market_data = await fetch_market_data()
    
    news_summary = "\n".join(
        f"- {a['title']}: {a['description']}" for a in news_articles
    )
    
    market_summary = "\n".join(
        f"- {asset}: ${info['price']:.2f} ({info['change_24h']:+.2f}%)"
        for asset, info in market_data.items()
    )

    chain = prompt | llm | parser

    log.info("agent.invoking", model=settings.gemini_model)
    decision: TradeDecision = await chain.ainvoke(
        {
            "format_instructions": parser.get_format_instructions(),
            "news_summary": news_summary,
            "market_data": market_summary,
        }
    )
    log.info(
        "agent.decision",
        action=decision.action,
        asset=decision.asset,
        confidence=decision.confidence_score,
    )
    return decision
