import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SpareChangeSourcesChartProps {
  sources: Array<{
    name: string;
    value: number;
    amount: number;
    color: string;
  }>;
}

export function SpareChangeSourcesChart({ sources }: SpareChangeSourcesChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">Spare Change Sources</h3>
        <p className="text-sm text-muted-foreground">Where your roundups come from</p>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {sources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1b26', borderColor: '#2f334d' }}
                itemStyle={{ color: '#c0caf5' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-4 mt-6 md:mt-0">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="text-sm">{source.name}</span>
              </div>
              <span className="font-medium">₺{source.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
