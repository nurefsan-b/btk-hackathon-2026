import { useState, useEffect, useCallback } from 'react';
import { PortfolioOverview } from '../components/portfolio/portfolio-overview';
import { AIPerformanceCard } from '../components/portfolio/ai-performance-card';
import { AIAgentAdvisor } from '../components/ai-agent-advisor';
import { AssetAllocationChart } from '../components/portfolio/asset-allocation-chart';
import { ActiveHoldingsTable } from '../components/portfolio/active-holdings-table';
import { ConnectionBanner } from '../components/connection-banner';
import { useAuth } from '../lib/auth-context';
import {
    getTradeHistory,
    getSavingsSummary,
    getAIAdvisor,
    triggerAITrade,
    type AIAdvisorResponse,
    type TradeResponse,
    type SavingsSummary,
} from '../lib/api';

export function Portfolio() {
    const { user } = useAuth();
    const [trades, setTrades] = useState<TradeResponse[]>([]);
    const [savings, setSavings] = useState<SavingsSummary | null>(null);
    const [advisor, setAdvisor] = useState<AIAdvisorResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

    const userId = user?.id || 'user_demo';

    const loadData = useCallback(async () => {
        try {
            const [tradeData, savingsData, advisorData] = await Promise.all([
                getTradeHistory(userId),
                getSavingsSummary(userId),
                getAIAdvisor(userId),
            ]);
            setTrades(tradeData);
            setSavings(savingsData);
            setAdvisor(advisorData);
            setIsBackendOnline(true);
        } catch (err) {
            console.error('Portfolio load error:', err);
            setAdvisor(null);
            setIsBackendOnline(false);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Data Mapping ──────────────────────────────────────────

    const visibleTrades = trades.filter(t => ['pending', 'paper', 'executed', 'simulated'].includes(t.status));
    const activeTrades = trades.filter(t => ['paper', 'executed', 'simulated'].includes(t.status));
    const reservedWithoutTrade = Math.max(
        (savings?.total_invested || 0) - visibleTrades.reduce((acc, t) => acc + t.amount_invested, 0),
        0,
    );
    const totalInvested = savings?.total_invested || 0;
    const totalProfit = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);
    const totalValue = totalInvested + totalProfit;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    const portfolioOverviewData = {
        totalValue,
        totalProfit,
        profitPercentage: parseFloat(profitPercentage.toFixed(1)),
        initialInvestment: totalInvested,
        activePositions: activeTrades.length,
        decisionCount: visibleTrades.length,
    };

    const aiDecisionsMapped = visibleTrades.map(t => ({
        id: t.id,
        amount: t.amount_invested,
        asset: t.asset,
        date: t.created_at.split('T')[0],
        reason: t.reasoning.length > 30 ? t.reasoning.substring(0, 30) + '...' : t.reasoning,
        performance: t.profit_loss ? (t.profit_loss > 0 ? `+${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%` : `${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%`) : t.status,
    }));

    const activeHoldingsMapped = activeTrades.map(t => ({
        id: t.id,
        name: t.asset,
        investedAmount: t.amount_invested,
        currentValue: t.amount_invested + (t.profit_loss || 0),
        return: t.profit_loss ? (t.profit_loss > 0 ? `+${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%` : `${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%`) : '+0.0%',
        aiOutlook: 'Positive',
        shares: (t.amount_invested / (t.executed_price || 100)).toFixed(2),
    }));
    if (reservedWithoutTrade > 0) {
        activeHoldingsMapped.unshift({
            id: 'reserved-ai-allocation',
            name: 'AI allocation pending',
            investedAmount: reservedWithoutTrade,
            currentValue: reservedWithoutTrade,
            return: 'pending',
            aiOutlook: 'Holding',
            shares: '-',
        });
    }

    // Asset allocation logic (simplified)
    const assetTotals: Record<string, number> = {};
    activeTrades.forEach(t => {
        assetTotals[t.asset] = (assetTotals[t.asset] || 0) + t.amount_invested;
    });
    if (reservedWithoutTrade > 0) {
        assetTotals['AI allocation pending'] = reservedWithoutTrade;
    }
    const allocatedTotal = Object.values(assetTotals).reduce((acc, amount) => acc + amount, 0);
    
    const assetAllocationMapped = Object.entries(assetTotals).map(([name, amount], idx) => ({
        name,
        amount,
        value: allocatedTotal > 0 ? Math.round((amount / allocatedTotal) * 100) : 0,
        color: ['#00ff88', '#8b5cf6', '#6366f1', '#14b8a6'][idx % 4],
    }));

    if (isLoading) {
        return (
            <main className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
                    <p className="text-muted-foreground animate-pulse">Analyzing portfolio...</p>
                </div>
            </main>
        );
    }

    return (
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
                            Portfolio
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            AI-Managed Investment Overview
                        </p>
                    </div>
                </div>

                <ConnectionBanner isOnline={isBackendOnline} />

                <AIAgentAdvisor 
                    amount={savings?.total_pending || 0} 
                    advisor={advisor}
                    isOnline={isBackendOnline}
                    onApprove={async () => {
                        // In portfolio page, we just trigger the trade if they click
                        // (Usually they'd do it from dashboard but consistency helps)
                        try {
                            await triggerAITrade(userId);
                            await loadData();
                            window.setTimeout(loadData, 2500);
                        } catch (e) {
                            console.error(e);
                        }
                    }}
                />

                <PortfolioOverview data={portfolioOverviewData} />

                <AIPerformanceCard decisions={aiDecisionsMapped} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AssetAllocationChart allocation={assetAllocationMapped} />
                    <div className="lg:col-span-2">
                        <ActiveHoldingsTable holdings={activeHoldingsMapped} />
                    </div>
                </div>
            </div>
        </main>
    );
}
