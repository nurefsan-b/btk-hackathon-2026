import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface SpareChangeSourcesChartProps {
  sources: Array<{
    name: string;
    value: number;
    amount: number;
    color: string;
  }>;
}

export function SpareChangeSourcesChart({ sources }: SpareChangeSourcesChartProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  // Helper to translate source names
  const translateSourceName = (name: string) => {
    if (!isTurkish) return name;
    switch (name) {
      case 'Food & Drink':
      case 'Food & Dining':
        return 'Yiyecek & İçecek';
      case 'Transportation':
        return 'Ulaşım';
      case 'Entertainment':
        return 'Eğlence';
      case 'Shopping':
        return 'Alışveriş';
      case 'Other':
        return 'Diğer';
      default:
        return name;
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-xl backdrop-blur-sm">
          <p className="text-sm mb-1">{translateSourceName(payload[0].name)}</p>
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
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {isTurkish ? 'Birikim Kaynakları' : 'Spare Change Sources'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isTurkish ? 'Yuvarlama birikimlerinizin hangi harcamalardan geldiği' : 'Where your roundups come from'}
        </p>
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
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full md:w-1/2 space-y-4 mt-6 md:mt-0">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }} />
                <span className="text-sm">{translateSourceName(source.name)}</span>
              </div>
              <span className="font-medium">₺{source.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
