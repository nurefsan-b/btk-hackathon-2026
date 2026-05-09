import { TrendingUp, ArrowUpRight } from 'lucide-react';
import { motion } from 'motion/react';

interface PortfolioOverviewProps {
  data: {
    totalValue: number;
    totalProfit: number;
    profitPercentage: number;
    initialInvestment: number;
  };
}

export function PortfolioOverview({ data }: PortfolioOverviewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-card/80 border border-border p-8 backdrop-blur-sm"
      style={{
        boxShadow: '0 0 40px rgba(0, 255, 136, 0.15), 0 0 80px rgba(139, 92, 246, 0.1)',
      }}
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#00ff88]/10 to-[#8b5cf6]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#6366f1]/10 to-transparent rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#14b8a6] flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#0a0e27]" />
              </div>
              <p className="text-sm text-muted-foreground">Total Portfolio Value</p>
            </div>
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl tracking-tight bg-gradient-to-r from-[#00ff88] via-[#14b8a6] to-[#00ff88] bg-clip-text text-transparent"
            >
              ₺{data.totalValue.toFixed(2)}
            </motion.div>
            <p className="text-sm text-muted-foreground mt-2">
              From ₺{data.initialInvestment.toFixed(2)} spare change
            </p>
          </div>

          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <ArrowUpRight className="w-5 h-5 text-[#00ff88]" />
                <p className="text-sm text-muted-foreground">Total Profit/Loss</p>
              </div>
              <div className="space-y-2">
                <div className="text-4xl tracking-tight text-[#00ff88]">
                  +₺{data.totalProfit.toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-[#00ff88]/20 px-3 py-1 rounded-lg border border-[#00ff88]/30">
                    <span className="text-[#00ff88]">+{data.profitPercentage}%</span>
                  </div>
                  <span className="text-sm text-muted-foreground">All Time</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Today's Change</p>
            <p className="text-lg text-[#00ff88]">+₺18.50</p>
            <p className="text-xs text-muted-foreground mt-1">+0.4%</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">AI Win Rate</p>
            <p className="text-lg text-foreground">87.5%</p>
            <p className="text-xs text-muted-foreground mt-1">14 of 16 decisions</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Active Positions</p>
            <p className="text-lg text-foreground">4</p>
            <p className="text-xs text-muted-foreground mt-1">Across 3 sectors</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
