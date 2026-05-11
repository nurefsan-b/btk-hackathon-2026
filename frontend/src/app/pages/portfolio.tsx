import { useState, useEffect, useCallback } from 'react';
import { PortfolioOverview } from '../components/portfolio/portfolio-overview';
import { AIPerformanceCard } from '../components/portfolio/ai-performance-card';
import { AssetAllocationChart } from '../components/portfolio/asset-allocation-chart';
import { ActiveHoldingsTable } from '../components/portfolio/active-holdings-table';
import { ConnectionBanner } from '../components/connection-banner';
import { useAuth } from '../lib/auth-context';
import {
    getTradeHistory,
    getSavingsSummary,
    type TradeResponse,
    type SavingsSummary,
} from '../lib/api';

export function Portfolio() {
    const { user } = useAuth();
    const [trades, setTrades] = useState<TradeResponse[]>([]);
    const [savings, setSavings] = useState<SavingsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

    const userId = user?.id || 'user_demo';

    const loadData = useCallback(async () => {
        try {
            const [tradeData, savingsData] = await Promise.all([
                getTradeHistory(userId),
                getSavingsSummary(userId),
            ]);
            setTrades(tradeData);
            setSavings(savingsData);
            setIsBackendOnline(true);
        } catch (err) {
            console.error('Portfolio load error:', err);
            setIsBackendOnline(false);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ─── Data Mapping ──────────────────────────────────────────

    const totalInvested = savings?.total_invested || 0;
    const totalProfit = trades.reduce((acc, t) => acc + (t.profit_loss || 0), 0);
    const totalValue = totalInvested + totalProfit;
    const profitPercentage = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    const portfolioOverviewData = {
        totalValue: totalValue || 4250.0, // Fallback to mock if zero
        totalProfit: totalProfit || 465.5,
        profitPercentage: parseFloat(profitPercentage.toFixed(1)) || 12.4,
        initialInvestment: totalInvested || 3784.5,
    };

    const aiDecisionsMapped = trades.map(t => ({
        id: t.id,
        amount: t.amount_invested,
        asset: t.asset,
        date: t.created_at.split('T')[0],
        reason: t.reasoning.length > 30 ? t.reasoning.substring(0, 30) + '...' : t.reasoning,
        performance: t.profit_loss ? (t.profit_loss > 0 ? `+${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%` : `${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%`) : 'N/A',
    }));

    const activeHoldingsMapped = trades.filter(t => t.status === 'executed').map(t => ({
        id: t.id,
        name: t.asset,
        investedAmount: t.amount_invested,
        currentValue: t.amount_invested + (t.profit_loss || 0),
        return: t.profit_loss ? (t.profit_loss > 0 ? `+${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%` : `${((t.profit_loss/t.amount_invested)*100).toFixed(1)}%`) : '+0.0%',
        aiOutlook: 'Positive',
        shares: (t.amount_invested / (t.executed_price || 100)).toFixed(2),
    }));

    // Asset allocation logic (simplified)
    const assetTotals: Record<string, number> = {};
    trades.forEach(t => {
        assetTotals[t.asset] = (assetTotals[t.asset] || 0) + t.amount_invested;
    });
    
    const assetAllocationMapped = Object.entries(assetTotals).map(([name, amount], idx) => ({
        name,
        amount,
        value: totalInvested > 0 ? Math.round((amount / totalInvested) * 100) : 25,
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

                <PortfolioOverview data={portfolioOverviewData} />

                <AIPerformanceCard decisions={aiDecisionsMapped.length > 0 ? aiDecisionsMapped : MOCK_DECISIONS} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AssetAllocationChart allocation={assetAllocationMapped.length > 0 ? assetAllocationMapped : MOCK_ALLOCATION} />
                    <div className="lg:col-span-2">
                        <ActiveHoldingsTable holdings={activeHoldingsMapped.length > 0 ? activeHoldingsMapped : MOCK_HOLDINGS} />
                    </div>
                </div>
            </div>
        </main>
    );
}

const MOCK_DECISIONS = [
    { id: '1', amount: 340.0, asset: 'X Technology Fund', date: '2026-05-08', reason: 'Positive Tech Sentiment', performance: '+8.2%' },
    { id: '2', amount: 280.0, asset: 'Green Energy Index', date: '2026-05-01', reason: 'Renewable Energy Surge', performance: '+15.7%' },
];

const MOCK_ALLOCATION = [
    { name: 'Technology Funds', value: 60, amount: 2550.0, color: '#00ff88' },
    { name: 'Renewable Energy', value: 30, amount: 1275.0, color: '#8b5cf6' },
    { name: 'Healthcare', value: 10, amount: 425.0, color: '#6366f1' },
];

const MOCK_HOLDINGS = [
    { id: '1', name: 'X Technology Fund', investedAmount: 650.0, currentValue: 704.3, return: '+8.4%', aiOutlook: 'Positive', shares: '26.40' },
    { id: '2', name: 'Green Energy Index', investedAmount: 1230.0, currentValue: 1423.41, return: '+15.7%', aiOutlook: 'Holding', shares: '41.20' },
];
