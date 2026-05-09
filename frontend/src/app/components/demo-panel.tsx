import { useState } from 'react';
import { Zap, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DemoPanelProps {
    onSimulate: (name: string, amount: number) => void;
}

export function DemoPanel({ onSimulate }: DemoPanelProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [transactionName, setTransactionName] = useState('Starbucks - Coffee');
    const [amount, setAmount] = useState('135.00');

    const handleSimulate = () => {
        const parsedAmount = parseFloat(amount);
        if (!isNaN(parsedAmount) && parsedAmount > 0 && transactionName.trim()) {
            onSimulate(transactionName, parsedAmount);
            setTransactionName('');
            setAmount('');
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', duration: 0.4 }}
                        className="mb-3 w-80 rounded-2xl bg-card border-2 border-accent shadow-2xl shadow-accent/20 backdrop-blur-md overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-accent to-secondary p-4">
                            <div className="flex items-center gap-2">
                                <Code2 className="w-5 h-5 text-white" />
                                <h3 className="text-white">Demo / Mock Triggers</h3>
                            </div>
                            <p className="text-xs text-white/80 mt-1">
                                For Hackathon Judges - Simulate Transactions
                            </p>
                        </div>

                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs text-muted-foreground mb-2">
                                    Transaction Name
                                </label>
                                <input
                                    type="text"
                                    value={transactionName}
                                    onChange={(e) => setTransactionName(e.target.value)}
                                    placeholder="e.g., Starbucks - Coffee"
                                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-muted-foreground mb-2">
                                    Amount (₺)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="e.g., 135.00"
                                    step="0.01"
                                    min="0"
                                    className="w-full bg-input-background border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
                                />
                            </div>

                            <button
                                onClick={handleSimulate}
                                className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30"
                            >
                                <Zap className="w-4 h-4" />
                                <span>Simulate Transaction</span>
                            </button>

                            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
                                <p className="text-xs text-muted-foreground">
                                    This simulates a backend webhook trigger. The transaction will be rounded up to the nearest ₺50, and the difference will be added to the savings pool.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="ml-auto w-14 h-14 rounded-full bg-gradient-to-r from-accent to-secondary shadow-xl shadow-accent/30 flex items-center justify-center text-white hover:shadow-2xl hover:shadow-accent/40 transition-all"
            >
                {isOpen ? (
                    <ChevronDown className="w-6 h-6" />
                ) : (
                    <ChevronUp className="w-6 h-6" />
                )}
            </motion.button>
        </div>
    );
}
