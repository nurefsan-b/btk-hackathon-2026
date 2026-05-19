import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';

interface SentimentCorrelationChartProps {
  data: Array<{
    date: string;
    sentiment: number;
    growth: number;
  }>;
}

export function SentimentCorrelationChart({ data }: SentimentCorrelationChartProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  // Helper to translate dates like "Apr 24" -> "24 Nis", "May 19" -> "19 May"
  const translateDate = (dateStr: string) => {
    if (!isTurkish) return dateStr;
    const parts = dateStr.split(' ');
    if (parts.length === 2) {
      const monthMap: Record<string, string> = {
        Jan: 'Oca', Feb: 'Şub', Mar: 'Mar', Apr: 'Nis',
        May: 'May', Jun: 'Haz', Jul: 'Tem', Aug: 'Ağu',
        Sep: 'Eyl', Oct: 'Eki', Nov: 'Kas', Dec: 'Ara'
      };
      const trMonth = monthMap[parts[0]] || parts[0];
      return `${parts[1]} ${trMonth}`;
    }
    return dateStr;
  };

  const translatedData = data.map(item => ({
    ...item,
    date: translateDate(item.date)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-sm mb-2 font-medium">{label}</p>
          <p className="text-xs text-[#00ff88] mb-1">
            {isTurkish ? 'Piyasa Duyarlılığı' : 'Market Sentiment'}: {payload[0].value}
          </p>
          <p className="text-xs text-[#8b5cf6]">
            {isTurkish ? 'Portföy Büyümesi' : 'Portfolio Growth'}: {payload[1].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {isTurkish ? 'Piyasa Duyarlılığı vs Portföy Büyümesi' : 'Market Sentiment vs Portfolio Growth'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isTurkish ? 'Son 30 güne ait yapay zeka korelasyon analizi' : 'AI correlation analysis over the last 30 days'}
        </p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={translatedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="sentiment"
              stroke="#00ff88"
              fillOpacity={1}
              fill="url(#colorSentiment)"
            />
            <Area
              type="monotone"
              dataKey="growth"
              stroke="#8b5cf6"
              fillOpacity={1}
              fill="url(#colorGrowth)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
