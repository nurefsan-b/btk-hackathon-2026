import { useState, useEffect, useCallback } from 'react';
import { SavingsPoolCard } from '../components/savings-pool-card';
import { TransactionsList } from '../components/transactions-list';
import { AIAgentAdvisor } from '../components/ai-agent-advisor';
import { DemoPanel } from '../components/demo-panel';
import { ConnectionBanner } from '../components/connection-banner';
import {
    createTransaction,
    getTransactions,
    getSavingsSummary,
    triggerAITrade,
    healthCheck,
    type TransactionResponse,
} from '../lib/api';

const DEMO_USER = 'user_demo';

interface DisplayTransaction {
    id: string;
    name: string;
    originalAmount: number;
    roundedAmount: number;
    extractedAmount: number;
    date: string;
    category: string;
}

function toDisplay(tx: TransactionResponse): DisplayTransaction {
    return {
        id: tx.id,
        name: tx.merchant ?? tx.description ?? 'Transaction',
        originalAmount: tx.amount,
        roundedAmount: tx.rounded_amount,
        extractedAmount: tx.round_up_diff,
        date: tx.created_at.split('T')[0],
        category: tx.merchant ? guessCategoryFromMerchant(tx.merchant) : 'Other',
    };
}

function guessCategoryFromMerchant(merchant: string): string {
    const m = merchant.toLowerCase();
    if (['starbucks', 'mcdonald', 'vapiano', 'restaurant', 'coffee'].some((k) => m.includes(k)))
        return 'Food & Drink';
    if (['metro', 'ulaşım', 'akaryakıt'].some((k) => m.includes(k))) return 'Transportation';
    if (['netflix', 'spotify'].some((k) => m.includes(k))) return 'Entertainment';
    if (['migros', 'a101', 'bim', 'şok', 'trendyol', 'hepsiburada', 'teknosa'].some((k) => m.includes(k)))
        return 'Shopping';
    return 'Other';
}

export function Dashboard() {
    const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalInvested, setTotalInvested] = useState(0);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [investLoading, setInvestLoading] = useState(false);

    // ── Fetch data from backend ─────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            const [txs, savings] = await Promise.all([
                getTransactions(DEMO_USER),
                getSavingsSummary(DEMO_USER),
            ]);
            setTransactions(txs.map(toDisplay));
            setTotalSavings(savings.total_pending);
            setTotalInvested(savings.total_invested);
            setIsBackendOnline(true);
        } catch {
            setIsBackendOnline(false);
            // Fallback to demo data when backend is unavailable
            setTransactions(FALLBACK_TRANSACTIONS);
            setTotalSavings(340.0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Simulate transaction (calls real backend) ───────────────
    const handleSimulateTransaction = async (name: string, amount: number) => {
        try {
            const tx = await createTransaction({
                user_id: DEMO_USER,
                amount,
                merchant: name,
                description: `POS - ${name}`,
                currency: 'TRY',
            });
            setTransactions((prev) => [toDisplay(tx), ...prev]);
            setTotalSavings((prev) => prev + tx.round_up_diff);
            setIsBackendOnline(true);
        } catch {
            // Offline fallback — update local state
            const roundedAmount = Math.ceil(amount / 10) * 10;
            const extractedAmount = roundedAmount - amount;
            const fallback: DisplayTransaction = {
                id: Date.now().toString(),
                name,
                originalAmount: amount,
                roundedAmount,
                extractedAmount,
                date: new Date().toISOString().split('T')[0],
                category: 'Simulated',
            };
            setTransactions((prev) => [fallback, ...prev]);
            setTotalSavings((prev) => prev + extractedAmount);
            setIsBackendOnline(false);
        }
    };

    // ── Approve AI investment (triggers real AI agent) ──────────
    const handleApproveInvestment = async () => {
        setInvestLoading(true);
        try {
            await triggerAITrade(DEMO_USER);
            setTotalSavings(0);
            setIsBackendOnline(true);
        } catch {
            setTotalSavings(0);
        } finally {
            setInvestLoading(false);
        }
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

                <ConnectionBanner isOnline={isBackendOnline} />

                <SavingsPoolCard
                    totalSavings={totalSavings}
                    totalInvested={totalInvested}
                />

                <AIAgentAdvisor
                    amount={totalSavings}
                    onApprove={handleApproveInvestment}
                    isLoading={investLoading}
                />

                {isLoading ? (
                    <div className="rounded-2xl bg-card border border-border p-12 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                            <span className="text-muted-foreground">Loading transactions...</span>
                        </div>
                    </div>
                ) : (
                    <TransactionsList transactions={transactions} />
                )}
            </div>

            <DemoPanel onSimulate={handleSimulateTransaction} />
        </main>
    );
}

// ── Fallback data when backend is offline ───────────────────────
const FALLBACK_TRANSACTIONS: DisplayTransaction[] = [
    {
        id: '1',
        name: 'Starbucks - Coffee',
        originalAmount: 135.0,
        roundedAmount: 140.0,
        extractedAmount: 5.0,
        date: '2026-05-08',
        category: 'Food & Drink',
    },
    {
        id: '2',
        name: 'Metro Card',
        originalAmount: 67.5,
        roundedAmount: 70.0,
        extractedAmount: 2.5,
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
        roundedAmount: 240.0,
        extractedAmount: 5.25,
        date: '2026-05-05',
        category: 'Shopping',
    },
    {
        id: '5',
        name: 'Restaurant - Dinner',
        originalAmount: 287.0,
        roundedAmount: 290.0,
        extractedAmount: 3.0,
        date: '2026-05-04',
        category: 'Food & Drink',
    },
];
