import { useState, useEffect, useCallback, useRef } from 'react';
import { SavingsPoolCard } from '../components/savings-pool-card';
import { TransactionsList } from '../components/transactions-list';
import { AIAgentAdvisor } from '../components/ai-agent-advisor';
import { DemoPanel } from '../components/demo-panel';
import { ConnectionBanner } from '../components/connection-banner';
import { useRequireAuth } from '../lib/use-require-auth';
import {
    createTransaction,
    getAIAdvisor,
    getTradeHistory,
    getTransactions,
    getSavingsSummary,
    triggerAITrade,
    watchTaskStatus,
    type AIAdvisorResponse,
    type TradeResponse,
    type TransactionResponse,
} from '../lib/api';
import { useTranslation } from 'react-i18next';

interface DisplayTransaction {
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

function tradeToDisplay(trade: TradeResponse): DisplayTransaction {
    return {
        id: `trade-${trade.id}`,
        name: `${trade.action.toUpperCase()} ${trade.asset}`,
        originalAmount: trade.amount_invested,
        roundedAmount: trade.amount_invested,
        extractedAmount: 0,
        date: trade.created_at.split('T')[0],
        category: 'Investment',
        type: 'investment',
        asset: trade.asset,
        status: trade.status,
    };
}

export function Dashboard() {
    const user = useRequireAuth();
    const { t } = useTranslation();
    const [transactions, setTransactions] = useState<DisplayTransaction[]>([]);
    const [totalSavings, setTotalSavings] = useState(0);
    const [totalInvested, setTotalInvested] = useState(0);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [investLoading, setInvestLoading] = useState(false);
    const [tradeStatus, setTradeStatus] = useState<'idle' | 'queued' | 'done' | 'error'>('idle');
    const [advisor, setAdvisor] = useState<AIAdvisorResponse | null>(null);
    // Ref to clean up the SSE stream if the component unmounts while waiting
    const sseCleanupRef = useRef<(() => void) | null>(null);
    const userId = user.id;

    // Clean up any open SSE stream on unmount
    useEffect(() => {
        return () => {
            sseCleanupRef.current?.();
        };
    }, []);

    // ── Fetch data from backend ─────────────────────────────────
    const loadData = useCallback(async () => {
        try {
            const [txs, savings, advisorData] = await Promise.all([
                getTransactions(userId),
                getSavingsSummary(userId),
                getAIAdvisor(userId),
            ]);
            const trades = await getTradeHistory(userId);
            const activity = [...txs.map(toDisplay), ...trades.map(tradeToDisplay)].sort(
                (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            );
            setTransactions(activity);
            setTotalSavings(savings.total_pending);
            setTotalInvested(savings.total_invested);
            setAdvisor(advisorData);
            setIsBackendOnline(true);
        } catch {
            setIsBackendOnline(false);
            setAdvisor(null);
            // Fallback to demo data when backend is unavailable
            setTransactions(FALLBACK_TRANSACTIONS);
            setTotalSavings(340.0);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ── Simulate transaction (calls real backend) ───────────────
    const handleSimulateTransaction = async (name: string, amount: number) => {
        try {
            const tx = await createTransaction({
                user_id: userId,
                amount,
                merchant: name,
                description: `POS - ${name}`,
                currency: 'TRY',
            });
            setTransactions((prev) => [toDisplay(tx), ...prev]);
            await loadData();
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

    // ── Approve AI investment (triggers real AI agent via SSE) ────
    const handleApproveInvestment = async () => {
        setInvestLoading(true);
        setTradeStatus('queued');
        try {
            const { task_id } = await triggerAITrade(userId);
            setIsBackendOnline(true);

            // Open SSE stream — fires loadData() as soon as Celery finishes.
            // No more guessing with setTimeout!
            const cleanup = watchTaskStatus(task_id, {
                onComplete: async () => {
                    await loadData();
                    setTradeStatus('done');
                    setInvestLoading(false);
                    // Reset badge after 4 s so it doesn't distract
                    window.setTimeout(() => setTradeStatus('idle'), 4000);
                },
                onError: async (reason) => {
                    console.error('[SSE] Trade error:', reason);
                    await loadData();
                    setTradeStatus('error');
                    setInvestLoading(false);
                    window.setTimeout(() => setTradeStatus('idle'), 6000);
                },
            });
            // Store cleanup so we can abort if user navigates away
            sseCleanupRef.current = cleanup;
        } catch {
            await loadData();
            setTradeStatus('error');
            setInvestLoading(false);
            window.setTimeout(() => setTradeStatus('idle'), 6000);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                            {t('dashboard.title')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                    {/* ── SSE trade status badge ───────────────── */}
                    {tradeStatus === 'queued' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 text-sm text-[#c4b5fd]">
                            <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse" />
                            {t('dashboard.ai_status_queued')}
                        </div>
                    )}
                    {tradeStatus === 'done' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00ff88]/15 border border-[#00ff88]/30 text-sm text-[#00ff88]">
                            <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
                            {t('dashboard.ai_status_done')}
                        </div>
                    )}
                    {tradeStatus === 'error' && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/15 border border-red-500/30 text-sm text-red-400">
                            <span className="w-2 h-2 rounded-full bg-red-500" />
                            {t('dashboard.ai_status_error')}
                        </div>
                    )}
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
                    advisor={advisor}
                    isOnline={isBackendOnline}
                />

                {isLoading ? (
                    <div className="rounded-2xl bg-card border border-border p-12 flex items-center justify-center">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                            <span className="text-muted-foreground">{t('dashboard.loading')}</span>
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
