import { Brain, AlertTriangle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import * as Switch from '@radix-ui/react-switch';

interface AIAutonomyCardProps {
  fullAutonomous: boolean;
  setFullAutonomous: (value: boolean) => void;
  riskTolerance: number;
  setRiskTolerance: (value: number) => void;
}

export function AIAutonomyCard({
  fullAutonomous,
  setFullAutonomous,
  riskTolerance,
  setRiskTolerance,
}: AIAutonomyCardProps) {
  const getRiskLabel = (value: number) => {
    if (value <= 25) return 'Conservative (Bonds & Stable Assets)';
    if (value <= 50) return 'Moderate (Balanced Portfolio)';
    if (value <= 75) return 'Growth (Tech & Emerging Markets)';
    return 'Aggressive (Crypto & High-Risk Tech)';
  };

  const getRiskColor = (value: number) => {
    if (value <= 25) return '#6366f1';
    if (value <= 50) return '#00ff88';
    if (value <= 75) return '#f59e0b';
    return '#ef4444';
  };

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
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl">AI Agent Authority</h2>
            <p className="text-xs text-muted-foreground">Configure autonomous decision-making</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-muted/20 rounded-xl p-5 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <label htmlFor="autonomous-mode" className="text-sm mb-1 block">
                  Full Autonomous Mode
                </label>
                <p className="text-xs text-muted-foreground">
                  AI will automatically invest your spare change without confirmation
                </p>
              </div>
              <Switch.Root
                id="autonomous-mode"
                checked={fullAutonomous}
                onCheckedChange={setFullAutonomous}
                className="w-12 h-6 bg-muted rounded-full relative data-[state=checked]:bg-[#00ff88] transition-colors"
              >
                <Switch.Thumb className="block w-5 h-5 bg-white rounded-full transition-transform translate-x-0.5 data-[state=checked]:translate-x-[26px] shadow-lg" />
              </Switch.Root>
            </div>

            {fullAutonomous && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded-lg p-3"
              >
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-[#f59e0b] mb-1">Warning: Full Autonomy Enabled</p>
                    <p className="text-xs text-muted-foreground">
                      The AI will execute investments immediately based on market sentiment analysis. You can review all transactions in your portfolio.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div className="bg-muted/20 rounded-xl p-5 border border-border/50">
            <label htmlFor="risk-tolerance" className="text-sm mb-4 block">
              Risk Tolerance Level
            </label>
            <div className="space-y-4">
              <div className="relative">
                <input
                  id="risk-tolerance"
                  type="range"
                  min="0"
                  max="100"
                  value={riskTolerance}
                  onChange={(e) => setRiskTolerance(Number(e.target.value))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #00ff88 33%, #f59e0b 66%, #ef4444 100%)`,
                  }}
                />
                <div
                  className="absolute top-[-8px] w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
                  style={{
                    left: `calc(${riskTolerance}% - 8px)`,
                    backgroundColor: getRiskColor(riskTolerance),
                    boxShadow: `0 0 20px ${getRiskColor(riskTolerance)}80`,
                  }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Moderate</span>
                <span>Growth</span>
                <span>Aggressive</span>
              </div>

              <div
                className="px-4 py-3 rounded-lg border"
                style={{
                  backgroundColor: `${getRiskColor(riskTolerance)}10`,
                  borderColor: `${getRiskColor(riskTolerance)}30`,
                }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" style={{ color: getRiskColor(riskTolerance) }} />
                  <span className="text-sm" style={{ color: getRiskColor(riskTolerance) }}>
                    {getRiskLabel(riskTolerance)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-muted/30 to-muted/20 rounded-lg p-4 border border-border/50">
            <p className="text-xs text-muted-foreground">
              AI respects your risk preferences when analyzing investment opportunities. Higher risk tolerance allows the AI to explore growth-oriented assets.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
