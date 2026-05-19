import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KPICards } from '../components/analytics/kpi-cards';
import { SentimentCorrelationChart } from '../components/analytics/sentiment-correlation-chart';
import { SpareChangeSourcesChart } from '../components/analytics/spare-change-sources-chart';
import { AIMarketAlerts } from '../components/analytics/ai-market-alerts';
import { ConnectionBanner } from '../components/connection-banner';
import { getAnalytics, type AnalyticsResponse } from '../lib/api';
import { useRequireAuth } from '../lib/use-require-auth';

export function Analytics() {
  const user = useRequireAuth();
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
  const userId = user.id;

  const loadData = useCallback(async () => {
    try {
      setAnalytics(await getAnalytics(userId));
      setIsBackendOnline(true);
    } catch (err) {
      console.error('Analytics load error:', err);
      setIsBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpiData = {
    predictionAccuracy: analytics?.kpis.prediction_accuracy ?? 0,
    accuracyTrend: analytics?.kpis.accuracy_trend ?? '+0.0%',
    totalRoundups: analytics?.kpis.total_roundups ?? 0,
    roundupsTrend: analytics?.kpis.roundups_trend ?? '+₺0.00',
    nextMonthForecast: analytics?.kpis.next_month_forecast ?? 0,
    forecastChange: analytics?.kpis.forecast_change ?? '+0.0%',
  };

  const sentimentData = analytics?.sentiment_correlation ?? [];
  const spareChangeSources = analytics?.spare_change_sources ?? [];
  const marketAlerts = analytics?.market_alerts ?? [];

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">
            {isTurkish ? 'Gelişmiş analitik yükleniyor...' : 'Loading analytics...'}
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
            {isTurkish ? 'Gelişmiş Analitik' : 'Analytics & AI Insights'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTurkish 
              ? 'Harcama alışkanlıklarınız ve piyasa duyarlılığının derin öğrenme tabanlı analizi'
              : 'Deep learning analysis of your financial habits and market sentiment'
            }
          </p>
        </div>

        <ConnectionBanner isOnline={isBackendOnline} />

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
