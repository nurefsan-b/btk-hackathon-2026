import { Newspaper, Sparkles, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface SentimentItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  sentimentScore: number;
  aiConclusion: string;
}

interface SentimentFeedProps {
  items: SentimentItem[];
}

export function SentimentFeed({ items }: SentimentFeedProps) {
  const getSentimentColor = (score: number) => {
    if (score >= 80) return { color: '#00ff88', label: 'Positive', bg: 'bg-[#00ff88]/10', border: 'border-[#00ff88]/30' };
    if (score >= 60) return { color: '#6366f1', label: 'Neutral-Positive', bg: 'bg-[#6366f1]/10', border: 'border-[#6366f1]/30' };
    if (score >= 40) return { color: '#94a3b8', label: 'Neutral', bg: 'bg-muted/30', border: 'border-border' };
    return { color: '#f59e0b', label: 'Negative', bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30' };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-[#14b8a6]/20 flex items-center justify-center">
          <Newspaper className="w-5 h-5 text-[#00ff88]" />
        </div>
        <div>
          <h2 className="text-lg">Real-time Sentiment Feed</h2>
          <p className="text-xs text-muted-foreground">AI-analyzed news and market intelligence</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {items.map((item, index) => {
          const sentiment = getSentimentColor(item.sentimentScore);
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="relative pl-6 pb-4 border-l-2 border-secondary/20 last:pb-0"
            >
              <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gradient-to-br from-secondary to-accent border-2 border-card"></div>

              <div className="bg-muted/20 rounded-xl p-4 border border-border/50 hover:bg-muted/30 hover:border-secondary/30 transition-all duration-200">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm leading-relaxed mb-2">{item.headline}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{item.source}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-lg ${sentiment.bg} border ${sentiment.border} flex-shrink-0`}>
                    <p className="text-xs" style={{ color: sentiment.color }}>
                      {item.sentimentScore}% {sentiment.label}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg p-3 border border-accent/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">AI Conclusion:</p>
                      <p className="text-sm leading-relaxed">{item.aiConclusion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-3 border border-border/50">
        <p className="text-xs text-muted-foreground">
          Feed updates every 5 minutes. AI processes 1,000+ sources continuously.
        </p>
      </div>
    </motion.div>
  );
}
