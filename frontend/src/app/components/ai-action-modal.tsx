import { Brain, TrendingUp, CheckCircle2, X, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

interface AIActionModalProps {
    amount: number;
    onApprove: () => void;
    onDismiss: () => void;
    isLoading?: boolean;
}

export function AIActionModal({ amount, onApprove, onDismiss, isLoading = false }: AIActionModalProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-br from-card via-secondary/5 to-accent/5 p-6 backdrop-blur-sm"
            style={{
                boxShadow: '0 0 60px rgba(139, 92, 246, 0.3), 0 0 100px rgba(99, 102, 241, 0.2)',
            }}
        >
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 via-accent/10 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#00ff88]/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg">AI Investment Opportunity</h3>
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                >
                                    <Sparkles className="w-4 h-4 text-[#00ff88]" />
                                </motion.div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Autonomous recommendation based on market analysis
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onDismiss}
                        disabled={isLoading}
                        className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl p-5 mb-6 border border-border/50">
                    <div className="flex items-start gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#00ff88]/20 flex items-center justify-center flex-shrink-0 mt-1">
                            <TrendingUp className="w-4 h-4 text-[#00ff88]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm leading-relaxed">
                                I have accumulated <span className="text-[#00ff88]">₺{amount.toFixed(2)}</span> from your spare change this week. I detected a{' '}
                                <span className="text-secondary">highly positive trend</span> in the technology sector based on my daily financial news sentiment analysis.
                            </p>
                        </div>
                    </div>

                    <div className="bg-card/50 rounded-lg p-4 border border-secondary/20">
                        <p className="text-sm mb-3">
                            Would you like me to automatically place a buy order for{' '}
                            <span className="text-secondary">X Technology Fund</span> with this idle{' '}
                            <span className="text-[#00ff88]">₺{amount.toFixed(2)}</span>?
                        </p>

                        <div className="grid grid-cols-3 gap-3 text-xs">
                            <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                                <p className="text-muted-foreground mb-1">Confidence</p>
                                <p className="text-[#00ff88]">92%</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                                <p className="text-muted-foreground mb-1">Risk Level</p>
                                <p className="text-accent">Medium</p>
                            </div>
                            <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                                <p className="text-muted-foreground mb-1">Est. Return</p>
                                <p className="text-foreground">8-12%</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onApprove}
                        disabled={isLoading}
                        className="flex-1 bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00ff88]/20 hover:shadow-xl hover:shadow-[#00ff88]/30 hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Executing...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                <span>Yes, Invest Now</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={onDismiss}
                        disabled={isLoading}
                        className="px-6 py-3 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 hover:border-border transition-all duration-200 disabled:opacity-50"
                    >
                        Dismiss
                    </button>
                </div>

                <p className="text-xs text-muted-foreground mt-4 text-center">
                    This decision is fully autonomous. I will execute the order immediately upon approval.
                </p>
            </div>
        </motion.div>
    );
}
