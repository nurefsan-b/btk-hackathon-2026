import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, ArrowRight, Loader2, CheckCircle2, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { sellTrade } from '../../lib/api';

interface Holding {
    id: string;
    name: string;
    currentValue: number;
    return: string;
}

interface QuickSellCardProps {
    holdings: Holding[];
    onSellComplete?: () => void;
}

export function QuickSellCard({ holdings, onSellComplete }: QuickSellCardProps) {
    const { t, i18n } = useTranslation();
    const isTurkish = i18n.language.startsWith('tr');
    const [sellingId, setSellingId] = useState<string | null>(null);
    const [soldIds, setSoldIds] = useState<string[]>([]);

    const validHoldings = holdings.filter(h => h.name !== 'AI allocation pending' && !soldIds.includes(h.id));

    const handleSell = async (id: string, name: string, value: number) => {
        setSellingId(id);
        
        try {
            await sellTrade(id);
            setSoldIds(prev => [...prev, id]);
            toast.success(
                isTurkish 
                    ? `${name} başarıyla satıldı! ₺${value.toFixed(2)} hesabınıza aktarıldı.` 
                    : `Successfully sold ${name}! ₺${value.toFixed(2)} transferred to your account.`
            );
            if (onSellComplete) {
                onSellComplete();
            }
        } catch (error) {
            console.error('Failed to sell trade:', error);
            toast.error(isTurkish ? 'Satış işlemi başarısız oldu.' : 'Failed to sell asset.');
        } finally {
            setSellingId(null);
        }
    };

    if (validHoldings.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card/30 rounded-2xl p-6 border border-border/30 border-dashed flex flex-col items-center justify-center text-center"
            >
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <TrendingDown className="w-6 h-6 text-muted-foreground/50" />
                </div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    {isTurkish ? 'Satılacak Varlık Bulunamadı' : 'No Assets to Sell'}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                    {isTurkish 
                        ? 'Yapay zeka henüz bir paper işlemi açmadığı için nakde çevrilecek bir varlığınız bulunmuyor.' 
                        : 'No active paper positions available to liquidate at the moment.'}
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-destructive/10 via-card to-card rounded-2xl p-6 border border-destructive/20"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/20 flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-destructive" />
                </div>
                <div>
                    <h3 className="text-lg font-medium">{isTurkish ? 'Hızlı Satış & Nakde Çevir' : 'Quick Sell & Liquidate'}</h3>
                    <p className="text-xs text-muted-foreground">
                        {isTurkish ? 'Kârınızı realize edin ve paranızı çekin' : 'Realize your profits and withdraw'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {validHoldings.map((holding) => (
                        <motion.div
                            key={holding.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, height: 0, margin: 0, padding: 0 }}
                            className="bg-card/50 rounded-xl p-4 border border-border/50 flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-medium text-sm">{holding.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {isTurkish ? 'Mevcut Değer' : 'Current Value'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">₺{holding.currentValue.toFixed(2)}</p>
                                    <p className={`text-xs ${holding.return.startsWith('+') ? 'text-[#00ff88]' : 'text-destructive'}`}>
                                        {holding.return}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleSell(holding.id, holding.name, holding.currentValue)}
                                disabled={sellingId !== null}
                                className="w-full py-2 px-4 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                            >
                                {sellingId === holding.id ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{isTurkish ? 'Satılıyor...' : 'Selling...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-4 h-4" />
                                        <span>{isTurkish ? 'Nakde Çevir' : 'Liquidate'}</span>
                                    </>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
