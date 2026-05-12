import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface Holding {
  id: string;
  name: string;
  investedAmount: number;
  currentValue: number;
  return: string;
  aiOutlook: string;
  shares: string;
}

interface ActiveHoldingsTableProps {
  holdings: Holding[];
}

export function ActiveHoldingsTable({ holdings }: ActiveHoldingsTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-[#14b8a6]/20 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#00ff88]" />
        </div>
        <div>
          <h2 className="text-lg">Active Holdings</h2>
          <p className="text-xs text-muted-foreground">Current investment positions</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-xs text-muted-foreground">Asset Name</th>
              <th className="text-left py-3 px-4 text-xs text-muted-foreground">Shares</th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground">Invested</th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground">Current Value</th>
              <th className="text-right py-3 px-4 text-xs text-muted-foreground">Return</th>
              <th className="text-center py-3 px-4 text-xs text-muted-foreground">AI Outlook</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  No active investment positions yet.
                </td>
              </tr>
            )}
            {holdings.map((holding, index) => (
              <motion.tr
                key={holding.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="border-b border-border/50 hover:bg-muted/20 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="text-sm">{holding.name}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-muted-foreground">{holding.shares}</td>
                <td className="py-4 px-4 text-right text-sm">₺{holding.investedAmount.toFixed(2)}</td>
                <td className="py-4 px-4 text-right text-sm">₺{holding.currentValue.toFixed(2)}</td>
                <td className="py-4 px-4 text-right">
                  <span className={`text-sm ${holding.return.startsWith('+') ? 'text-[#00ff88]' : 'text-destructive'}`}>
                    {holding.return}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center">
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs ${holding.aiOutlook === 'Positive'
                          ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30'
                          : 'bg-accent/10 text-accent border border-accent/30'
                        }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{holding.aiOutlook}</span>
                    </div>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-4 border border-border/50">
        <p className="text-xs text-muted-foreground">
          All positions are actively monitored by AI. Outlooks are updated based on real-time market sentiment and news analysis.
        </p>
      </div>
    </motion.div>
  );
}
