import { motion } from 'motion/react';
import { AlertCircle, ArrowUpRight, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AIMarketAlertsProps {
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export function AIMarketAlerts({ alerts }: AIMarketAlertsProps) {
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <ArrowUpRight className="w-5 h-5 text-[#00ff88]" />;
      case 'warning':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-400" />;
    }
  };

  // Helper to translate timestamp string: "X min ago" -> "X dk önce", "X hours ago" -> "X saat önce"
  const translateTimestamp = (timeStr: string) => {
    if (!isTurkish) return timeStr;
    return timeStr
      .replace(/mins? ago/i, 'dk önce')
      .replace(/hours? ago/i, 'saat önce')
      .replace(/days? ago/i, 'gün önce');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-2xl bg-card border border-border"
    >
      <div className="mb-6">
        <h3 className="text-lg font-medium">
          {isTurkish ? 'AI Piyasa Uyarıları' : 'AI Market Alerts'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {isTurkish ? 'Portföyünüze dayalı gerçek zamanlı piyasa analizleri' : 'Real-time insights based on your portfolio'}
        </p>
      </div>
      <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 p-4 rounded-xl bg-background border border-border/50"
          >
            <div className="mt-1">{getIcon(alert.type)}</div>
            <div>
              <p className="text-sm">{alert.message}</p>
              <span className="text-xs text-muted-foreground mt-1 block">
                {translateTimestamp(alert.timestamp)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
