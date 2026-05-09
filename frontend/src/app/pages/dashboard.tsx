import { useState } from 'react';
import { SavingsPoolCard } from '../components/savings-pool-card';
import { TransactionsList } from '../components/transactions-list';
import { AIActionModal } from '../components/ai-action-modal';
import { DemoPanel } from '../components/demo-panel';

interface Transaction {
    id: string;
    name: string;
    originalAmount: number;
    roundedAmount: number;
    extractedAmount: number;
    date: string;
    category: string;
}

export function Dashboard() {
    const [totalSavings, setTotalSavings] = useState(340.0);
    const [showAIModal, setShowAIModal] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([
        {
            id: '1',
            name: 'Starbucks - Coffee',
            originalAmount: 135.0,
            roundedAmount: 150.0,
            extractedAmount: 15.0,
            date: '2026-05-08',
            category: 'Food & Drink',
        },
        {
            id: '2',
            name: 'Metro Card',
            originalAmount: 67.5,
            roundedAmount: 100.0,
            extractedAmount: 32.5,
            date: '2026-05-07',
            category: 'Transportation',
        },
        {
            id: '3',
            name: 'Netflix Subscription',
            originalAmount: 99.99,
            roundedAmount: 100.0,
            extractedAmount: 0.01,
            date: '2026-05-06',
            category: 'Entertainment',
        },
        {
            id: '4',
            name: 'Grocery Store',
            originalAmount: 234.75,
            roundedAmount: 250.0,
            extractedAmount: 15.25,
            date: '2026-05-05',
            category: 'Shopping',
        },
        {
            id: '5',
            name: 'Restaurant - Dinner',
            originalAmount: 287.0,
            roundedAmount: 300.0,
            extractedAmount: 13.0,
            date: '2026-05-04',
            category: 'Food & Drink',
        },
    ]);

    const handleSimulateTransaction = (name: string, amount: number) => {
        const roundedAmount = Math.ceil(amount / 50) * 50;
        const extractedAmount = roundedAmount - amount;

        const newTransaction: Transaction = {
            id: Date.now().toString(),
            name,
            originalAmount: amount,
            roundedAmount,
            extractedAmount,
            date: new Date().toISOString().split('T')[0],
            category: 'Simulated',
        };

        setTransactions([newTransaction, ...transactions]);
        setTotalSavings(totalSavings + extractedAmount);
    };

    const handleApproveInvestment = () => {
        setShowAIModal(false);
        setTotalSavings(0);
    };

    const handleDismissInvestment = () => {
        setShowAIModal(false);
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                            Küsürat-AI
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Micro-Investment Agent
                        </p>
                    </div>
                </div>

                <SavingsPoolCard totalSavings={totalSavings} />

                {showAIModal && totalSavings >= 340 && (
                    <AIActionModal
                        amount={totalSavings}
                        onApprove={handleApproveInvestment}
                        onDismiss={handleDismissInvestment}
                    />
                )}

                <TransactionsList transactions={transactions} />
            </div>

            <DemoPanel onSimulate={handleSimulateTransaction} />
        </main>
    );
}
