import { BrainStatus } from '../components/ai-insights/brain-status';
import { SentimentFeed } from '../components/ai-insights/sentiment-feed';
import { ReasoningLog } from '../components/ai-insights/reasoning-log';

export function AIInsights() {
  const brainMetrics = {
    articlesAnalyzed: 1245,
    marketSentiment: 'Bullish',
    isScanning: true,
    activeSources: 127,
  };

  const sentimentItems = [
    {
      id: '1',
      headline: 'Tech sector sees massive growth in Q3 earnings reports',
      source: 'Financial Times',
      timestamp: '15 min ago',
      sentimentScore: 92,
      aiConclusion: 'High probability of short-term gains in Tech Funds. Added to watchlist for next round-up investment.',
    },
    {
      id: '2',
      headline: 'Renewable energy companies exceed market expectations',
      source: 'Bloomberg',
      timestamp: '1 hour ago',
      sentimentScore: 88,
      aiConclusion: 'Strong positive sentiment. Renewable Energy Index showing sustained growth pattern. Recommended for portfolio allocation.',
    },
    {
      id: '3',
      headline: 'Global markets remain stable amid economic uncertainty',
      source: 'Reuters',
      timestamp: '2 hours ago',
      sentimentScore: 65,
      aiConclusion: 'Neutral sentiment. Maintaining current positions. No immediate action required.',
    },
    {
      id: '4',
      headline: 'E-commerce sector faces headwinds from supply chain issues',
      source: 'Wall Street Journal',
      timestamp: '3 hours ago',
      sentimentScore: 38,
      aiConclusion: 'Negative trend detected. Avoiding e-commerce allocations. Reallocating funds to more stable sectors.',
    },
    {
      id: '5',
      headline: 'AI and machine learning investments surge 40% year-over-year',
      source: 'TechCrunch',
      timestamp: '4 hours ago',
      sentimentScore: 95,
      aiConclusion: 'Exceptional positive sentiment. AI sector showing strong momentum. Increased allocation to technology funds.',
    },
  ];

  const reasoningSteps = [
    {
      step: 1,
      title: 'Accumulated Spare Change',
      description: 'Collected ₺340.00 from user transactions through intelligent round-up algorithm.',
      status: 'completed',
    },
    {
      step: 2,
      title: 'Market Analysis',
      description: 'Detected positive trend in Renewable Energy sector. Sentiment score: 88/100 across 45 articles.',
      status: 'completed',
    },
    {
      step: 3,
      title: 'Risk Assessment',
      description: 'Risk level (Medium) aligns with user preferences. Expected return: 8-12% annually.',
      status: 'completed',
    },
    {
      step: 4,
      title: 'Decision Made',
      description: 'Action: Prompted user to invest ₺340 in Green Energy Index Fund.',
      status: 'active',
    },
  ];

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
