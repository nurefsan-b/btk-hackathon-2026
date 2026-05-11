import { TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface SavingsPoolCardProps {
    totalSavings: number;
    totalInvested?: number;
}

export function SavingsPoolCard({ totalSavings, totalInvested = 0 }: SavingsPoolCardProps) {
    const allTime = totalSavings + totalInvested;

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
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00ff88]/10 to-[#8b5cf6]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#6366f1]/10 to-transparent rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88] to-[#14b8a6] flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-[#0a0e27]" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Savings Pool</p>
                            <div className="flex items-center gap-2 mt-1">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: 'easeInOut',
                                    }}
                                    className="w-2 h-2 rounded-full bg-[#00ff88]"
                                ></motion.div>
                                <span className="text-xs text-[#00ff88]">AI Monitoring Active</span>
                            </div>
                        </div>
                    </div>
                    <Sparkles className="w-6 h-6 text-[#8b5cf6] animate-pulse" />
                </div>

                <div className="space-y-2">
                    <motion.div
                        key={totalSavings}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-5xl tracking-tight bg-gradient-to-r from-[#00ff88] via-[#14b8a6] to-[#00ff88] bg-clip-text text-transparent"
                    >
                        ₺{totalSavings.toFixed(2)}
                    </motion.div>
                    <p className="text-sm text-muted-foreground">
                        Accumulated from spare change roundups
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Pending</p>
                        <p className="text-lg text-[#00ff88]">₺{totalSavings.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Invested</p>
                        <p className="text-lg text-foreground">₺{totalInvested.toFixed(2)}</p>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">All Time</p>
                        <p className="text-lg text-foreground">₺{allTime.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
