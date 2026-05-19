import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { BrainStatus } from '../components/ai-insights/brain-status';
import { SentimentFeed } from '../components/ai-insights/sentiment-feed';
import { ReasoningLog } from '../components/ai-insights/reasoning-log';
import { ConnectionBanner } from '../components/connection-banner';
import { useRequireAuth } from '../lib/use-require-auth';
import { getAIInsights, type AIInsightsResponse } from '../lib/api';

export function AIInsights() {
    const user = useRequireAuth();
    const { t, i18n } = useTranslation();
    const isTurkish = i18n.language.startsWith('tr');

    const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

    const userId = user.id;

    const loadData = useCallback(async () => {
        try {
            const insightData = await getAIInsights(userId);
            setInsights(insightData);
            setIsBackendOnline(true);
        } catch (err) {
            console.error('AI Insights load error:', err);
            setIsBackendOnline(false);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Data Mapping ──────────────────────────────────────────

    const brainMetrics = insights
        ? {
            articlesAnalyzed: insights.brain_metrics.articles_analyzed,
            marketSentiment: insights.brain_metrics.market_sentiment,
            isScanning: insights.brain_metrics.is_scanning,
            activeSources: insights.brain_metrics.active_sources,
        }
        : MOCK_BRAIN_METRICS;

    const rawReasoningSteps = insights?.reasoning_steps ?? MOCK_REASONING_STEPS;
    
    // Dynamically translate reasoning steps on client side
    const reasoningSteps = rawReasoningSteps.map(step => {
        if (!isTurkish) return step;
        
        const title = step.title || '';
        const description = step.description || '';
        let trTitle = title;
        let trDesc = description;
        
        // Match Titles
        if (title.includes('News Collection')) {
            trTitle = 'Haber Toplama';
            trDesc = description.replace(/(\d+) financial headlines collected before decisioning\./i, '$1 finansal başlık karar öncesi toplandı.');
        } else if (title.includes('Sentiment Scoring')) {
            trTitle = 'Duyarlılık Puanlaması';
            trDesc = description.replace(/Market sentiment scored at (.*?)\/100 and mapped against (.*?)\./i, 'Piyasa duyarlılığı $1/100 olarak puanlandı ve $2 ile eşleştirildi.');
        } else if (title.includes('Risk Gate')) {
            trTitle = 'Risk Geçidi';
            trDesc = description
                .replace(/Confidence score (.*?)%? passed the paper-trading risk check\./i, 'Güven skoru %$1, demo işlem risk kontrolünü geçti.')
                .replace(/Confidence score (.*?)%? failed the paper-trading risk check\./i, 'Güven skoru %$1, demo işlem risk kontrolünü geçemedi.');
        } else if (title.includes('Execution')) {
            trTitle = 'İşlem Gerçekleştirme';
            let temp = description;
            temp = temp.replace(/buy (.*?) for (.*?)\./gi, '$1 satın alımı ($2).');
            temp = temp.replace(/sell (.*?) for (.*?)\./gi, '$1 satışı ($2).');
            temp = temp.replace(/hold\./gi, 'Beklemede kal.');
            temp = temp.replace(/Gemini analysis was unavailable, so the demo risk fallback allocated the spare-change pool to/gi, 'Gemini analizi kullanılamadı, bu nedenle demo risk güvencesi birikim havuzunu şu varlığa yönlendirdi:');
            trDesc = temp;
        } else if (title.includes('Accumulated Spare Change')) {
            trTitle = 'Birikmiş Bozuk Para';
            trDesc = description.replace(/Collected (.*?) from user transactions./i, 'Kullanıcı işlemlerinden $1 toplandı.');
        } else if (title.includes('Market Analysis')) {
            trTitle = 'Piyasa Analizi';
            trDesc = description.replace(/Detected constructive signal for (.*?)\. Sentiment: (.*?)\./i, '$1 için yapıcı sinyal tespit edildi. Sinyal gücü: $2.');
            trDesc = trDesc.replace(/Detected bullish signal for (.*?)\. Sentiment: (.*?)\./i, '$1 için yükseliş sinyali tespit edildi. Sinyal gücü: $2.');
        } else if (title.includes('Risk Assessment')) {
            trTitle = 'Risk Değerlendirmesi';
            trDesc = description.replace(/Risk level aligns with preferences\. Confidence: (.*?)\./i, 'Risk seviyesi kullanıcı tercihleriyle uyumlu. Güven derecesi: $1.');
        } else if (title.includes('Decision Made')) {
            trTitle = 'Karar Verildi';
            trDesc = description.replace(/Action: Open a (.*?) (.*?) paper position\./i, 'Eylem: $1 tutarında $2 paper pozisyonu aç.');
            trDesc = trDesc.replace(/Action: Hold/i, 'Eylem: Beklemede Kal.');
        }
        
        return {
            ...step,
            title: trTitle,
            description: trDesc
        };
    });

    const rawSentimentItems = insights?.sentiment_feed ?? SENTIMENT_ITEMS;
    const sentimentItems = rawSentimentItems.map((item) => {
        let headline = item.headline || '';
        let source = item.source || '';
        const timestamp = item.timestamp || '';
        const score = item.sentiment_score ?? (item as any).sentimentScore ?? 50;
        let aiConclusion = item.ai_conclusion ?? (item as any).aiConclusion ?? '';
        
        if (isTurkish) {
            if (source === 'Demo News') {
                source = 'Demo Haberleri';
            }
            // Translate mock templates
            if (headline.includes('BIST100 momentum improves after positive market close')) {
                headline = 'BIST100 ivmesi pozitif piyasa kapanışının ardından güçleniyor';
            }
            if (headline.includes('Gold steadies as global risk appetite changes')) {
                headline = 'Küresel risk iştahı değiştikçe altın dengeleniyor';
            }
            
            if (aiConclusion.includes('High probability of short-term gains')) {
                aiConclusion = 'BIST100\'de kısa vadeli kazanç olasılığı yüksek.';
            }
            if (aiConclusion.includes('Strong positive sentiment. XAU remains in the supported watchlist')) {
                aiConclusion = 'Güçlü pozitif sinyal. Altın (XAU) desteklenen izleme listesinde kalmaya devam ediyor.';
            }
            if (aiConclusion.includes('Positive signal detected; agent may prefer growth assets')) {
                aiConclusion = 'Pozitif sinyal algılandı; AI Danışman risk profiline uygun olarak büyüme odaklı varlıkları tercih edebilir.';
            }
            if (aiConclusion.includes('Mildly supportive news flow; agent keeps allocation balanced')) {
                aiConclusion = 'Hafif destekleyici haber akışı; AI Danışman varlık dağılımını dengeli tutuyor.';
            }
            if (aiConclusion.includes('Mixed signal; agent waits for higher confidence')) {
                aiConclusion = 'Karışık sinyaller; AI Danışman pozisyon artırmadan önce daha yüksek güven derecesi bekliyor.';
            }
            if (aiConclusion.includes('Risk signal detected; agent reduces exposure')) {
                aiConclusion = 'Risk sinyali algılandı; AI Danışman riskli varlık oranını düşürüyor veya savunmacı varlıkları tercih ediyor.';
            }
        }

        return {
            id: item.id,
            headline,
            source,
            timestamp,
            sentimentScore: score,
            aiConclusion,
        };
    });

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">
                        {isTurkish ? 'AI Zihni Eşitleniyor...' : 'Syncing AI Brain...'}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                        {isTurkish ? 'AI Karar Odası' : 'AI Intelligence Hub'}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {isTurkish 
                            ? 'Gerçek zamanlı piyasa duyarlılığı analizleri ve otonom karar gerekçe günlükleri'
                            : 'Real-time market sentiment analysis and autonomous reasoning logs'
                        }
                    </p>
                </div>

                <ConnectionBanner isOnline={isBackendOnline} />

                <BrainStatus metrics={brainMetrics} />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <SentimentFeed items={sentimentItems} />
                    </div>
                    <div className="lg:col-span-2">
                        <ReasoningLog steps={reasoningSteps} />
                    </div>
                </div>
            </div>
        </main>
    );
}

const MOCK_BRAIN_METRICS = {
    articlesAnalyzed: 126,
    marketSentiment: 'Scanning',
    isScanning: true,
    activeSources: 3,
};

const MOCK_REASONING_STEPS = [
    { step: 1, title: 'Accumulated Spare Change', description: 'Collected ₺340.00 from user transactions.', status: 'completed' as const },
    { step: 2, title: 'Market Analysis', description: 'Detected constructive signal for BIST100. Sentiment: 88/100.', status: 'completed' as const },
    { step: 3, title: 'Risk Assessment', description: 'Risk level aligns with preferences. Confidence: 92%.', status: 'completed' as const },
    { step: 4, title: 'Decision Made', description: 'Action: Open a ₺340 BIST100 paper position.', status: 'active' as const },
];

const SENTIMENT_ITEMS = [
    { id: '1', headline: 'BIST100 momentum improves after positive market close', source: 'Financial Times', timestamp: '15 min ago', sentimentScore: 92, aiConclusion: 'High probability of short-term gains in BIST100.' },
    { id: '2', headline: 'Gold steadies as global risk appetite changes', source: 'Bloomberg', timestamp: '1 hour ago', sentimentScore: 88, aiConclusion: 'Strong positive sentiment. XAU remains in the supported watchlist.' },
];
