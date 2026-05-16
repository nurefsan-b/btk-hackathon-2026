import { useState, useEffect, useCallback } from 'react';
import { BrainStatus } from '../components/ai-insights/brain-status';
import { SentimentFeed } from '../components/ai-insights/sentiment-feed';
import { ReasoningLog } from '../components/ai-insights/reasoning-log';
import { ConnectionBanner } from '../components/connection-banner';
import { useAuth } from '../lib/auth-context';
import { getAIInsights, type AIInsightsResponse } from '../lib/api';

export function AIInsights() {
    const { user } = useAuth();
    const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

    const userId = user?.id || 'user_demo';

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

    const reasoningSteps = insights?.reasoning_steps ?? MOCK_REASONING_STEPS;
    const sentimentItems = insights?.sentiment_feed.map((item) => ({
        id: item.id,
        headline: item.headline,
        source: item.source,
        timestamp: item.timestamp,
        sentimentScore: item.sentiment_score,
        aiConclusion: item.ai_conclusion,
    })) ?? SENTIMENT_ITEMS;

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Syncing AI Brain...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                        AI Intelligence Hub
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time market sentiment analysis and autonomous reasoning logs
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
