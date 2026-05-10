import { Target, TrendingUp, Wallet } from 'lucide-react';
import { motion } from 'motion/react';

interface KPICardsProps {
  data: {
    predictionAccuracy: number;
    accuracyTrend: string;
    totalRoundups: number;
    roundupsTrend: string;
    nextMonthForecast: number;
    forecastChange: string;
  };
}

export function KPICards({ data }: KPICardsProps) {
  const cards = [
    {
      title: 'Prediction Accuracy',
      value: `${data.predictionAccuracy}%`,
      trend: data.accuracyTrend,
      icon: Target,
      color: '#00ff88',
    },
    {
      title: 'Total Roundups',
      value: `₺${data.totalRoundups.toFixed(2)}`,
      trend: data.roundupsTrend,
      icon: Wallet,
      color: '#8b5cf6',
    },
    {
      title: 'Next Month Forecast',
      value: `₺${data.nextMonthForecast.toFixed(2)}`,
      trend: data.forecastChange,
      icon: TrendingUp,
      color: '#6366f1',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">{card.title}</p>
                <h3 className="text-2xl font-semibold mt-2">{card.value}</h3>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${card.color}20` }}>
                <Icon className="w-5 h-5" style={{ color: card.color }} />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm" style={{ color: card.color }}>
                {card.trend}
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
