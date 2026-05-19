import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { type TradeResponse } from '../lib/api';

interface AssetDistributionChartProps {
    trades: TradeResponse[];
}

const ASSET_COLORS: Record<string, string> = {
    'BIST100': '#14b8a6', // Teal
    'XAU': '#f59e0b',     // Amber
    'USD': '#00ff88',     // Green
    'EUR': '#6366f1',     // Indigo
    'BTC': '#8b5cf6',     // Purple
    'AI ALLOCATION PENDING': '#00ff88', // Green (match Portfolio pending color)
    'OTHER': '#94a3b8',   // Slate
};

export function AssetDistributionChart({ trades }: AssetDistributionChartProps) {
    // Group trades by asset and sum amount
    const distributionMap = trades.reduce((acc, trade) => {
        if (trade.status !== 'executed' && trade.status !== 'simulated' && trade.status !== 'paper') return acc;
        const asset = trade.asset.toUpperCase();
        acc[asset] = (acc[asset] || 0) + trade.amount_invested;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(distributionMap).map(([name, value]) => ({
        name,
        value,
        color: ASSET_COLORS[name] || ASSET_COLORS['OTHER']
    })).sort((a, b) => b.value - a.value);

    // If no data, show empty state or placeholder
    if (data.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl bg-card border border-border p-8 flex flex-col items-center justify-center text-center min-h-[300px]"
            >
                <PieChartIcon className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">No investments yet to show distribution.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl bg-card border border-border p-6 shadow-sm flex flex-col h-full"
        >
            <div className="flex items-center gap-2 mb-6">
                <PieChartIcon className="w-5 h-5 text-[#00ff88]" />
                <h3 className="text-lg font-medium">Asset Distribution</h3>
            </div>

            <div className="flex-1 min-h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#1e293b',
                                border: '1px solid #334155',
                                borderRadius: '8px',
                                color: '#f8fafc'
                            }}
                            itemStyle={{ color: '#f8fafc' }}
                            formatter={(value: number) => `₺${value.toFixed(2)}`}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
}
