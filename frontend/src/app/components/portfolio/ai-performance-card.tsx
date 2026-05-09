import { Brain, Sparkles, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface AIDecision {
  id: string;
  amount: number;
  asset: string;
  date: string;
  reason: string;
  performance: string;
}

interface AIPerformanceCardProps {
  decisions: AIDecision[];
}

export function AIPerformanceCard({ decisions }: AIPerformanceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl border-2 border-secondary/30 bg-gradient-to-br from-card via-secondary/5 to-accent/5 p-6 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.2), 0 0 60px rgba(99, 102, 241, 0.15)',
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/10 via-accent/5 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl">AI Agent Decisions</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Autonomous investments driven by news analysis
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#00ff88]/10 px-3 py-1.5 rounded-lg border border-[#00ff88]/30">
            <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse"></div>
            <span className="text-xs text-[#00ff88]">Active</span>
          </div>
        </div>

        <div className="space-y-4">
          {decisions.map((decision, index) => (
            <motion.div
              key={decision.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-6 pb-4 border-l-2 border-secondary/30 last:pb-0"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-secondary to-accent border-2 border-card"></div>

              <div className="bg-muted/20 rounded-xl p-4 border border-border/50 hover:bg-muted/30 hover:border-secondary/30 transition-all duration-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                      <span className="text-sm">
                        Invested <span className="text-[#00ff88]">₺{decision.amount.toFixed(2)}</span> in{' '}
                        <span className="text-secondary">{decision.asset}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(decision.date).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${decision.performance.startsWith('+') ? 'text-[#00ff88]' : 'text-destructive'}`}>
                      {decision.performance}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg border border-accent/20">
                  <Sparkles className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-accent-foreground">
                    <span className="text-muted-foreground">Reason:</span> {decision.reason}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-4 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00ff88]" />
              <span className="text-sm text-muted-foreground">
                All decisions are made autonomously based on real-time sentiment analysis
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
