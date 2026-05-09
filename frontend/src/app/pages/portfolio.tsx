import { PortfolioOverview } from '../components/portfolio/portfolio-overview';
import { AIPerformanceCard } from '../components/portfolio/ai-performance-card';
import { AssetAllocationChart } from '../components/portfolio/asset-allocation-chart';
import { ActiveHoldingsTable } from '../components/portfolio/active-holdings-table';

export function Portfolio() {
    const portfolioData = {
        totalValue: 4250.0,
        totalProfit: 465.5,
        profitPercentage: 12.4,
        initialInvestment: 3784.5,
    };

    const aiDecisions = [
        {
            id: '1',
            amount: 340.0,
            asset: 'X Technology Fund',
            date: '2026-05-08',
            reason: 'Positive Tech Sentiment',
            performance: '+8.2%',
        },
        {
            id: '2',
            amount: 280.0,
            asset: 'Green Energy Index',
            date: '2026-05-01',
            reason: 'Renewable Energy Surge',
            performance: '+15.7%',
        },
        {
            id: '3',
            amount: 310.0,
            asset: 'X Technology Fund',
            date: '2026-04-24',
            reason: 'AI Sector Growth',
            performance: '+11.3%',
        },
        {
            id: '4',
            amount: 260.0,
            asset: 'Healthcare Innovation',
            date: '2026-04-17',
            reason: 'Biotech Breakthrough News',
            performance: '+6.9%',
        },
    ];

    const assetAllocation = [
        { name: 'Technology Funds', value: 60, amount: 2550.0, color: '#00ff88' },
        { name: 'Renewable Energy', value: 30, amount: 1275.0, color: '#8b5cf6' },
        { name: 'Healthcare', value: 7, amount: 297.5, color: '#6366f1' },
        { name: 'Cash/Savings Pool', value: 3, amount: 127.5, color: '#14b8a6' },
    ];

    const activeHoldings = [
        {
            id: '1',
            name: 'X Technology Fund',
            investedAmount: 650.0,
            currentValue: 704.3,
            return: '+8.4%',
            aiOutlook: 'Positive',
            shares: 26.4,
        },
        {
            id: '2',
            name: 'Green Energy Index',
            investedAmount: 1230.0,
            currentValue: 1423.41,
            return: '+15.7%',
            aiOutlook: 'Holding',
            shares: 41.2,
        },
        {
            id: '3',
            name: 'Healthcare Innovation',
            investedAmount: 520.0,
            currentValue: 555.88,
            return: '+6.9%',
            aiOutlook: 'Positive',
            shares: 18.5,
        },
        {
            id: '4',
            name: 'Global Tech ETF',
            investedAmount: 1044.5,
            currentValue: 1162.94,
            return: '+11.3%',
            aiOutlook: 'Holding',
            shares: 34.8,
        },
    ];

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

                <PortfolioOverview data={portfolioData} />

                <AIPerformanceCard decisions={aiDecisions} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AssetAllocationChart allocation={assetAllocation} />
                    <div className="lg:col-span-2">
                        <ActiveHoldingsTable holdings={activeHoldings} />
                    </div>
                </div>
            </div>
        </main>
    );
}
