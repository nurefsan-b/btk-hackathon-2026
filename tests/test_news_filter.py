from __future__ import annotations

from app.ai.news_fetcher import filter_relevant_financial_news


def test_news_filter_removes_irrelevant_accident_story():
    articles = [
        {
            "title": "Fen lisesi hayali yem karma makinesinde son buldu",
            "description": "Yem karma makinesine kapılan 13 yaşındaki Mehmet hayatını kaybetti.",
            "source": "Yeniçağ",
            "published_at": "2026-05-15T06:50:03Z",
        },
        {
            "title": "THYAO hisseleri Borsa İstanbul'da yükseldi",
            "description": "Türk Hava Yolları için olumlu bilanço beklentisi arttı.",
            "source": "Market News",
            "published_at": "Latest",
        },
    ]

    filtered = filter_relevant_financial_news(articles, query="THYAO OR Türk Hava Yolları")

    assert len(filtered) == 1
    assert filtered[0]["title"] == "THYAO hisseleri Borsa İstanbul'da yükseldi"


def test_news_filter_returns_safe_empty_state_when_no_relevant_news():
    filtered = filter_relevant_financial_news(
        [
            {
                "title": "Mahallede trafik kazası",
                "description": "Kazada iki kişi yaralandı.",
                "source": "Local News",
                "published_at": "Latest",
            }
        ],
        query="ASELS OR Aselsan",
    )

    assert filtered[0]["source"] == "MicroFon Filter"
    assert "No finance-specific article" in filtered[0]["description"]
