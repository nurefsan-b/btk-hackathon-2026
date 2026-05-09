import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'motion/react';
import { PieChart as PieChartIcon } from 'lucide-react';

interface AssetAllocation {
  name: string;
  value: number;
  amount: number;
  color: string;
}

interface AssetAllocationChartProps {
  allocation: AssetAllocation[];
}

export function AssetAllocationChart({ allocation }: AssetAllocationChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-sm mb-1">{payload[0].name}</p>
          <p className="text-xs text-muted-foreground">
            ₺{payload[0].payload.amount.toFixed(2)} ({payload[0].value}%)
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
      transition={{ duration: 0.5, delay: 0.2 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-secondary/20 flex items-center justify-center">
          <PieChartIcon className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg">Asset Allocation</h2>
          <p className="text-xs text-muted-foreground">Portfolio distribution</p>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocation}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              dataKey="value"
            >
              {allocation.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 space-y-3">
        {allocation.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm">{item.name}</span>
            </div>
            <div className="text-right">
              <p className="text-sm">{item.value}%</p>
              <p className="text-xs text-muted-foreground">₺{item.amount.toFixed(2)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
