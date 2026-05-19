from __future__ import annotations

import httpx
import structlog
from tenacity import retry, stop_after_attempt, wait_exponential

from app.config import get_settings

log = structlog.get_logger()
settings = get_settings()

FINANCIAL_KEYWORDS = [
    "borsa", "hisse", "enflasyon", "faiz", "altın", "dolar", "euro",
    "BIST", "Türkiye ekonomi", "Fed", "merkez bankası", "resesyon",
    "piyasa", "ekonomi", "finans", "yatırım", "bankacılık", "endeks",
    "tahvil", "kur", "emtia", "petrol", "bitcoin", "kripto", "şirket",
    "bilanço", "halka arz", "temettü", "THYAO", "ASELS", "KCHOL",
    "SISE", "EREGL", "GARAN", "AKBNK",
]

IRRELEVANT_NEWS_TERMS = [
    "kaza", "hayatını kaybetti", "yaşamını yitirdi", "öldü", "ölüm",
    "yaralandı", "yaralı", "hastane", "cinayet", "yangın", "deprem",
    "trafik", "fen lisesi", "yem karma", "makineye kapıldı", "asayiş",
    "magazin", "spor", "futbol",
]

PLACEHOLDER_API_KEYS = {
    "your-newsapi-key-here",
    "your-newsapi-key-placeholder",
}


def _fallback_to_mock(retry_state) -> list[dict]:
    """Fallback when all retries are exhausted by tenacity."""
    exc = retry_state.outcome.exception()
    log.error("news_fetcher.all_retries_failed", error=str(exc), msg="Falling back to mock news")
    return _mock_news()


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry_error_callback=_fallback_to_mock,
)
async def fetch_financial_news(query: str = "Türkiye ekonomi borsa") -> list[dict]:  # type: ignore[return]
    """
    Fetch recent financial news headlines from NewsAPI.
    Retries up to 3 times with exponential backoff (tenacity).
    """
    if not _has_real_news_api_key():
        log.warning("news_fetcher.no_api_key", msg="Using mock news data")
        return _mock_news()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                settings.news_api_url,
                params={
                    "q": query,
                    "language": "tr",
                    "sortBy": "publishedAt",
                    "pageSize": 10,
                    "apiKey": settings.news_api_key,
                },
            )
            response.raise_for_status()
            data = response.json()
            articles = data.get("articles", [])
            normalized_articles = [
                {
                    "title": a["title"],
                    "description": a.get("description", ""),
                    "source": (a.get("source") or {}).get("name") or "NewsAPI",
                    "published_at": a.get("publishedAt") or "Latest",
                }
                for a in articles
            ]
            filtered_articles = filter_relevant_financial_news(
                normalized_articles,
                query=query,
            )
            log.info(
                "news_fetcher.success",
                count=len(articles),
                filtered_count=len(filtered_articles),
            )
            return filtered_articles
    except httpx.HTTPStatusError as exc:
        # Don't retry on fatal errors (e.g., bad API key)
        if exc.response.status_code in {401, 403, 404, 422}:
            log.warning(
                "news_fetcher.fatal_http_error",
                status_code=exc.response.status_code,
                msg="Using mock news data immediately without retry",
            )
            return _mock_news()
        # For 429 (Rate Limit) and 5xx (Server Error), raise to trigger retry
        log.warning("news_fetcher.retrying_http_error", status_code=exc.response.status_code)
        raise
    except httpx.RequestError as exc:
        # For connection timeouts and network errors, raise to trigger retry
        log.warning("news_fetcher.retrying_network_error", error=str(exc))
        raise


def _has_real_news_api_key() -> bool:
    key = settings.news_api_key.strip()
    return bool(key) and key.lower() not in PLACEHOLDER_API_KEYS


def filter_relevant_financial_news(
    articles: list[dict],
    *,
    query: str,
) -> list[dict]:
    query_terms = _query_terms(query)
    filtered = [
        article
        for article in articles
        if _is_relevant_financial_article(article, query_terms)
    ]
    if filtered:
        return filtered
    return [
        {
            "title": "No directly relevant market news found",
            "description": f"No finance-specific article matched the query: {query}.",
            "source": "MicroFon Filter",
            "published_at": "Latest",
        }
    ]


def _is_relevant_financial_article(article: dict, query_terms: set[str]) -> bool:
    text = f"{article.get('title') or ''} {article.get('description') or ''}".lower()
    if any(term in text for term in IRRELEVANT_NEWS_TERMS):
        return False

    financial_hit = any(keyword.lower() in text for keyword in FINANCIAL_KEYWORDS)
    query_hit = any(term in text for term in query_terms)
    return financial_hit or query_hit


def _query_terms(query: str) -> set[str]:
    separators = [" OR ", " or ", "|", "(", ")", "\"", "'"]
    normalized = query
    for separator in separators:
        normalized = normalized.replace(separator, " ")
    terms = {
        term.strip().lower()
        for term in normalized.split()
        if len(term.strip()) >= 3 and term.strip().lower() not in {"try", "and"}
    }
    return terms


def _mock_news() -> list[dict]:
    """Fallback mock news for development/testing without a real API key."""
    return [
        {
            "title": "Borsa İstanbul'da sert yükseliş: BIST100 endeksi rekor kırdı",
            "description": "Küresel piyasalardaki iyimserlik BIST100'ü yukarı taşıdı.",
            "source": "Demo News",
            "published_at": "5 min ago",
        },
        {
            "title": "Merkez Bankası faiz kararını açıkladı",
            "description": "TCMB politika faizini sabit tuttu, piyasalar olumlu karşıladı.",
            "source": "Demo News",
            "published_at": "18 min ago",
        },
        {
            "title": "Altın fiyatları Fed beklentileriyle geriledi",
            "description": "Ons altın 2.300 dolar sınırının altına indi.",
            "source": "Demo News",
            "published_at": "32 min ago",
        },
    ]
