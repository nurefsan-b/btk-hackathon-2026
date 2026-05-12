import { ArrowRight, Coffee, Train, Video, ShoppingBag, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface Transaction {
    id: string;
    name: string;
    originalAmount: number;
    roundedAmount: number;
    extractedAmount: number;
    date: string;
    category: string;
    type?: 'purchase' | 'investment';
    asset?: string;
    status?: string;
}

interface TransactionsListProps {
    transactions: Transaction[];
}

import { type ComponentType } from 'react';

const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
    'Food & Drink': Coffee,
    Transportation: Train,
    Entertainment: Video,
    Shopping: ShoppingBag,
    Simulated: UtensilsCrossed,
    Investment: TrendingUp,
};

export function TransactionsList({ transactions }: TransactionsListProps) {
    return (
        <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl">Recent Transactions</h2>
                <span className="text-sm text-muted-foreground">
                    {transactions.length} transactions
                </span>
            </div>

            <div className="space-y-3">
                {transactions.map((transaction, index) => {
                    const Icon = categoryIcons[transaction.category] || ShoppingBag;
                    return (
                        <motion.div
                            key={transaction.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border/50 hover:bg-muted/30 hover:border-secondary/30 transition-all duration-200 group"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Icon className="w-5 h-5 text-secondary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm mb-1">{transaction.name}</p>
                                    <p className="text-xs text-muted-foreground">{transaction.category}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    {transaction.type === 'investment' ? (
                                        <>
                                            <div className="text-sm text-[#00ff88]">
                                                ₺{transaction.originalAmount.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                {transaction.asset} · {transaction.status}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground line-through">
                                                    ₺{transaction.originalAmount.toFixed(2)}
                                                </span>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm">
                                                    ₺{transaction.roundedAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="text-xs text-[#00ff88] mt-1 flex items-center justify-end gap-1">
                                                <span>+₺{transaction.extractedAmount.toFixed(2)}</span>
                                                <span className="text-muted-foreground">saved</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
