import { Brain, TrendingUp, CheckCircle2, Sparkles, Loader2, Search, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';

interface Discovery {
    id: string;
    text: string;
    type: 'analysis' | 'sentiment' | 'opportunity';
    timestamp: Date;
}

interface AIAgentAdvisorProps {
    amount: number;
    onApprove: () => void;
    isLoading?: boolean;
}

export function AIAgentAdvisor({ amount, onApprove, isLoading = false }: AIAgentAdvisorProps) {
    const [discoveries, setDiscoveries] = useState<Discovery[]>([
        {
            id: '1',
            text: 'Scanning market sentiment for Technology sector...',
            type: 'analysis',
            timestamp: new Date()
        }
    ]);

    // Simulate "filling up" with discoveries
    useEffect(() => {
        const potentialDiscoveries: Omit<Discovery, 'id' | 'timestamp'>[] = [
            { text: 'Detected 12% increase in Social Media buzz for XTech.', type: 'sentiment' },
            { text: 'Interest rates stabilized, favorable for Growth Stocks.', type: 'analysis' },
            { text: 'Micro-savings threshold reached ₺100. Checking opportunities...', type: 'opportunity' },
            { text: 'Found high-confidence entry point for Global Tech Fund.', type: 'opportunity' },
            { text: 'Sentiment analysis score: 92/100 (Strong Bullish).', type: 'sentiment' },
            { text: 'Scanning renewable energy sector news...', type: 'analysis' },
            { text: 'Inflation data lower than expected. Positive for markets.', type: 'analysis' },
            { text: 'Tech sector RSI indicates oversold conditions. Buy signal.', type: 'opportunity' },
        ];

        let index = 0;
        const interval = setInterval(() => {
            setDiscoveries(prev => {
                const nextDiscovery = potentialDiscoveries[index % potentialDiscoveries.length];
                index++;
                return [
                    ...prev,
                    { ...nextDiscovery, id: Math.random().toString(), timestamp: new Date() }
                ].slice(-4); // Keep last 4
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    const canInvest = amount >= 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-br from-card via-secondary/5 to-accent/5 p-6 backdrop-blur-sm"
            style={{
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
            }}
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/10 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">AI Agent Advisor</h3>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                </motion.div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Live autonomous analysis
                            </p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-secondary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Active</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discoveries Feed */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <Search className="w-3 h-3" />
                            <span>Recent Discoveries</span>
                        </div>
                        <div className="space-y-2 min-h-[160px]">
                            <AnimatePresence mode="popLayout">
                                {discoveries.map((discovery) => (
                                    <motion.div
                                        key={discovery.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs"
                                    >
                                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            discovery.type === 'opportunity' ? 'bg-[#00ff88]' : 
                                            discovery.type === 'sentiment' ? 'bg-secondary' : 'bg-accent'
                                        }`} />
                                        <p className="flex-1 leading-relaxed">{discovery.text}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-5 border border-border/50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-4 h-4 text-[#00ff88]" />
                                <span className="text-sm font-medium">Investment Recommendation</span>
                            </div>

                            {canInvest ? (
                                <div className="space-y-4">
                                    <p className="text-sm leading-relaxed">
                                        I've accumulated <span className="text-[#00ff88] font-bold">₺{amount.toFixed(2)}</span>. Market conditions for <span className="text-secondary font-medium">X Technology Fund</span> are optimal.
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">Confidence</p>
                                            <p className="text-xs font-bold text-[#00ff88]">94%</p>
                                        </div>
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">Risk</p>
                                            <p className="text-xs font-bold text-accent">Med</p>
                                        </div>
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">Return</p>
                                            <p className="text-xs font-bold">~12%</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-secondary to-accent"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(amount / 100) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Waiting for savings pool to reach <span className="text-foreground">₺100.00</span> before execution. 
                                        Currently at <span className="text-secondary font-bold">₺{amount.toFixed(2)}</span>.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={onApprove}
                                disabled={isLoading || !canInvest}
                                className="w-full bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00ff88]/10 hover:shadow-[#00ff88]/20 hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-bold">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-sm font-bold">Approve & Invest Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <BarChart3 className="w-3 h-3" />
                            <span>Sentiment: Bullish</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>Volatility: Low</span>
                        </div>
                    </div>
                    <span>ID: AGENT-RX-72</span>
                </div>
            </div>
        </motion.div>
    );
}
