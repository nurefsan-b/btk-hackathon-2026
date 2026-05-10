import { KPICards } from '../components/analytics/kpi-cards';
import { SentimentCorrelationChart } from '../components/analytics/sentiment-correlation-chart';
import { SpareChangeSourcesChart } from '../components/analytics/spare-change-sources-chart';
import { AIMarketAlerts } from '../components/analytics/ai-market-alerts';

export function Analytics() {
  const kpiData = {
    predictionAccuracy: 94.2,
    accuracyTrend: '+2.1%',
    totalRoundups: 1240.0,
    roundupsTrend: '+180.00',
    nextMonthForecast: 450.0,
    forecastChange: '+15%',
  };

  const sentimentData = [
    { date: 'Apr 15', sentiment: 65, growth: 2.1 },
    { date: 'Apr 20', sentiment: 72, growth: 3.8 },
    { date: 'Apr 25', sentiment: 68, growth: 3.2 },
    { date: 'Apr 30', sentiment: 85, growth: 7.5 },
    { date: 'May 05', sentiment: 91, growth: 11.2 },
    { date: 'May 10', sentiment: 88, growth: 12.4 },
  ];

  const spareChangeSources = [
    { name: 'Coffee & Dining', value: 40, amount: 496.0, color: '#00ff88' },
    { name: 'Transportation', value: 35, amount: 434.0, color: '#8b5cf6' },
    { name: 'Shopping', value: 25, amount: 310.0, color: '#6366f1' },
  ];

  const marketAlerts = [
    {
      id: '1',
      type: 'positive',
      message: 'Technology sector shows strong upward momentum. AI executing buy orders.',
      timestamp: '2 hours ago',
    },
    {
      id: '2',
      type: 'warning',
      message: 'E-commerce sector shows negative sentiment today. Holding funds.',
      timestamp: '5 hours ago',
    },
    {
      id: '3',
      type: 'positive',
      message: 'Renewable energy news sentiment +18%. Position increased by AI.',
      timestamp: '1 day ago',
    },
    {
      id: '4',
      type: 'neutral',
      message: 'Healthcare sector stable. AI recommends maintaining current allocation.',
      timestamp: '1 day ago',
    },
    {
      id: '5',
      type: 'warning',
      message: 'Global market volatility detected. AI reducing exposure to high-risk assets.',
      timestamp: '2 days ago',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
            Analytics & AI Insights
          </h1>
          <p className="text-muted-foreground mt-1">
            Deep learning analysis of your financial habits and market sentiment
          </p>
        </div>

        <KPICards data={kpiData} />

        <SentimentCorrelationChart data={sentimentData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpareChangeSourcesChart sources={spareChangeSources} />
          <AIMarketAlerts alerts={marketAlerts} />
        </div>
      </div>
    </main>
  );
}
