import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SentimentCorrelationChartProps {
  data: Array<{
    date: string;
    sentiment: number;
    growth: number;
  }>;
}

export function SentimentCorrelationChart({ data }: SentimentCorrelationChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">Market Sentiment vs Portfolio Growth</h3>
        <p className="text-sm text-muted-foreground">AI correlation analysis over the last 30 days</p>
      </div>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
            <Tooltip
              contentStyle={{ backgroundColor: '#1a1b26', borderColor: '#2f334d' }}
              itemStyle={{ color: '#c0caf5' }}
            />
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
