import { Brain, TrendingUp, Newspaper, Radio } from 'lucide-react';
import { motion } from 'motion/react';

interface BrainStatusProps {
  metrics: {
    articlesAnalyzed: number;
    marketSentiment: string;
    isScanning: boolean;
    activeSources: number;
  };
}

export function BrainStatus({ metrics }: BrainStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-secondary/5 to-accent/5 border-2 border-secondary/30 p-6 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 40px rgba(139, 92, 246, 0.2)',
      }}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#8b5cf6]/10 to-[#6366f1]/10 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl">AI Brain Status</h2>
              <p className="text-xs text-muted-foreground">Neural network activity monitor</p>
            </div>
          </div>
          {metrics.isScanning && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 rounded-lg border border-[#00ff88]/30">
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-2 h-2 rounded-full bg-[#00ff88]"
              ></motion.div>
              <span className="text-sm text-[#00ff88]">AI is actively scanning markets</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-xs text-muted-foreground">Articles Analyzed</span>
            </div>
            <p className="text-2xl text-[#8b5cf6]">{metrics.articlesAnalyzed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">Today</p>
          </div>

          <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#00ff88]" />
              <span className="text-xs text-muted-foreground">Market Sentiment</span>
            </div>
            <p className="text-2xl text-[#00ff88]">{metrics.marketSentiment}</p>
            <p className="text-xs text-muted-foreground mt-1">Overall</p>
          </div>

          <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Radio className="w-4 h-4 text-[#6366f1]" />
              <span className="text-xs text-muted-foreground">Active Sources</span>
            </div>
            <p className="text-2xl text-[#6366f1]">{metrics.activeSources}</p>
            <p className="text-xs text-muted-foreground mt-1">Live feeds</p>
          </div>

          <div className="bg-gradient-to-br from-[#00ff88]/10 to-[#14b8a6]/10 rounded-xl p-4 border border-[#00ff88]/30">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-[#00ff88]" />
              <span className="text-xs text-muted-foreground">Neural State</span>
            </div>
            <p className="text-2xl text-[#00ff88]">Optimal</p>
            <p className="text-xs text-muted-foreground mt-1">All systems active</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
