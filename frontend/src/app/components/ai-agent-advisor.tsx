import { Brain, TrendingUp, CheckCircle2, Sparkles, Loader2, Search, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { type AIAdvisorResponse } from '../lib/api';

interface Discovery {
    id: string;
    text: string;
    type: 'analysis' | 'sentiment' | 'opportunity';
}

interface AIAgentAdvisorProps {
    amount: number;
    onApprove: () => void;
    isLoading?: boolean;
    advisor?: AIAdvisorResponse | null;
    isOnline?: boolean | null;
}

export function AIAgentAdvisor({ amount, onApprove, isLoading = false, advisor, isOnline }: AIAgentAdvisorProps) {
    const { t, i18n } = useTranslation();
    const isTurkish = i18n.language.startsWith('tr');

    const canInvest = amount >= 100;

    // Discovery translations helper
    const translateDiscovery = (text: string) => {
        if (!isTurkish) return text;
        let result = text;
        result = result.replace(/Scanning supported assets:\s*(.*)\./i, 'Desteklenen varlıklar taranıyor: $1.');
        result = result.replace(/Market sentiment for\s*(.*?):\s*(\d+\/\d+)\s*\((.*?)\)\./i, (match, asset, score, label) => {
            const labels: Record<string, string> = {
                'Constructive': 'Yapıcı',
                'Bullish': 'Yükseliş',
                'Bearish': 'Düşüş',
                'Neutral': 'Nötr',
                'Defensive': 'Savunmacı',
                'Cautious': 'Temkinli',
            };
            const trLabel = labels[label] || label;
            return `${asset} için piyasa sinyali: ${score} (${trLabel}).`;
        });
        result = result.replace(/Savings pool is\s*(.*?);\s*execution threshold is\s*(.*?)\./i, 'Birikim havuzu: $1; işlem eşiği: $2.');
        result = result.replace(/Latest paper position:\s*(buy|sell|hold)\s*(.*?)\./i, (match, action, asset) => {
            const trAction = action.toLowerCase() === 'buy' ? 'Al' : action.toLowerCase() === 'sell' ? 'Sat' : 'Bekle';
            return `Son paper işlem pozisyonu: ${asset} ${trAction}.`;
        });
        return result;
    };

    // Recommendation translations helper
    const translateRecommendation = (text: string) => {
        if (!isTurkish) return text;
        let result = text;
        result = result.replace(/Accumulated (.*?)\. Waiting for the savings pool to reach (.*?) before considering (.*?)\./i, 
            '$1 biriktirildi. $3 işlemi değerlendirilmeden önce birikim havuzunun $2 tutarına ulaşması bekleniyor.');
        result = result.replace(/Accumulated (.*?)\. Market sentiment is (.*?);\s*the advisor is holding instead of opening a new (.*?) paper position\./i,
            (match, acc, sentiment, asset) => {
                const trSent = sentiment.toLowerCase() === 'bullish' ? 'Yükseliş' : 
                               sentiment.toLowerCase() === 'bearish' ? 'Düşüş' : 
                               sentiment.toLowerCase() === 'constructive' ? 'Yapıcı' : 'Nötr';
                return `${acc} biriktirildi. Piyasa sinyali: ${trSent}; danışman yeni bir ${asset} paper pozisyonu açmak yerine beklemeyi tercih ediyor.`;
            });
        result = result.replace(/Accumulated (.*?)\. Market sentiment is (.*?);\s*the advisor is ready to open a (.*?) paper position\./i,
            (match, acc, sentiment, asset) => {
                const trSent = sentiment.toLowerCase() === 'bullish' ? 'Yükseliş' : 
                               sentiment.toLowerCase() === 'bearish' ? 'Düşüş' : 
                               sentiment.toLowerCase() === 'constructive' ? 'Yapıcı' : 'Nötr';
                return `${acc} biriktirildi. Piyasa sinyali: ${trSent}; danışman ${asset} paper pozisyonu açmaya hazır.`;
            });
        return result;
    };

    // Risk level translations helper
    const translateRisk = (riskText: string) => {
        if (!isTurkish) return riskText;
        const risks: Record<string, string> = {
            'Low': 'Düşük',
            'Medium': 'Orta',
            'High': 'Yüksek',
        };
        return risks[riskText] || riskText;
    };

    // Sentiment label translations helper
    const translateSentimentLabel = (sentimentText: string) => {
        if (!isTurkish) return sentimentText;
        const sentiments: Record<string, string> = {
            'Bullish': 'Yükseliş',
            'Constructive': 'Yapıcı',
            'Neutral': 'Nötr',
            'Defensive': 'Savunmacı',
            'Cautious': 'Temkinli',
            'Pending': 'Beklemede'
        };
        return sentiments[sentimentText] || sentimentText;
    };

    const rawDiscoveries = advisor?.discoveries ?? [
        {
            id: 'offline',
            text: isOnline === false
                ? 'Backend offline; live advisor data is unavailable.'
                : 'Waiting for advisor signal from backend.',
            type: 'analysis',
        },
    ];

    const discoveries: Discovery[] = rawDiscoveries.map(d => ({
        ...d,
        text: translateDiscovery(d.text)
    }));

    const confidence = advisor ? `${Math.round(advisor.confidence_score * 100)}%` : '--';
    const risk = translateRisk(advisor?.risk_level ?? '--');
    const expectedReturn = advisor?.expected_return_label ?? '--';
    const recommendation = translateRecommendation(
        advisor?.recommendation ?? `Accumulated ₺${amount.toFixed(2)}. Waiting for backend advisor data.`
    );
    const selectedAsset = advisor?.asset ?? 'BIST100';
    const marketSentiment = translateSentimentLabel(advisor?.market_sentiment ?? 'Pending');
    const canApprove = canInvest && advisor?.action === 'buy';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border-2 border-secondary bg-gradient-to-br from-card via-secondary/5 to-accent/5 p-6 backdrop-blur-sm"
            style={{
                boxShadow: '0 0 40px rgba(139, 92, 246, 0.15)',
            }}
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/10 via-accent/5 to-transparent rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-medium">{t('dashboard.ai_active')}</h3>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                </motion.div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {isTurkish ? 'Canlı otonom karar analizi' : 'Live autonomous analysis'}
                            </p>
                        </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-secondary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">
                            {isTurkish ? 'AKTİF' : 'ACTIVE'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discoveries Feed */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                            <Search className="w-3 h-3" />
                            <span>{isTurkish ? 'Son Tespitler' : 'Recent Discoveries'}</span>
                        </div>
                        <div className="space-y-2 min-h-[160px]">
                            <AnimatePresence mode="popLayout">
                                {discoveries.map((discovery) => (
                                    <motion.div
                                        key={discovery.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 text-xs"
                                    >
                                        <div className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                            discovery.type === 'opportunity' ? 'bg-[#00ff88]' : 
                                            discovery.type === 'sentiment' ? 'bg-secondary' : 'bg-accent'
                                        }`} />
                                        <p className="flex-1 leading-relaxed">{discovery.text}</p>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-gradient-to-br from-muted/50 to-muted/20 rounded-xl p-5 border border-border/50 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-4 h-4 text-[#00ff88]" />
                                <span className="text-sm font-medium">{t('dashboard.ai_advisor_suggests')}</span>
                            </div>

                            {canInvest ? (
                                <div className="space-y-4">
                                    <p className="text-sm leading-relaxed">
                                        {recommendation}
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">{t('dashboard.confidence_score')}</p>
                                            <p className="text-xs font-bold text-[#00ff88]">{confidence}</p>
                                        </div>
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">{t('dashboard.risk_level')}</p>
                                            <p className="text-xs font-bold text-accent">{risk}</p>
                                        </div>
                                        <div className="bg-card/50 rounded-lg p-2 border border-border/30 text-center">
                                            <p className="text-[10px] text-muted-foreground">{isTurkish ? 'Getiri' : 'Return'}</p>
                                            <p className="text-xs font-bold">{expectedReturn}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <motion.div 
                                            className="h-full bg-gradient-to-r from-secondary to-accent"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(amount / 100) * 100}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {isTurkish ? (
                                            <>
                                                Paper işlem açılması için birikim havuzunun <span className="text-foreground">₺100.00</span> tutarına ulaşması bekleniyor. 
                                                Şu anki tutar: <span className="text-secondary font-bold">₺{amount.toFixed(2)}</span>.
                                            </>
                                        ) : (
                                            <>
                                                Waiting for savings pool to reach <span className="text-foreground">₺100.00</span> before execution. 
                                                Currently at <span className="text-secondary font-bold">₺{amount.toFixed(2)}</span>.
                                            </>
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={onApprove}
                                disabled={isLoading || !canApprove}
                                className="w-full bg-gradient-to-r from-[#00ff88] to-[#14b8a6] hover:from-[#00ff88]/90 hover:to-[#14b8a6]/90 text-[#0a0e27] px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#00ff88]/10 hover:shadow-[#00ff88]/20 hover:scale-[1.02] disabled:opacity-30 disabled:hover:scale-100 disabled:grayscale"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm font-bold">{isTurkish ? 'İşleniyor...' : 'Processing...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-sm font-bold">
                                            {advisor?.action === 'hold' 
                                                ? (isTurkish ? 'Danışman Beklemede' : 'Advisor Holding') 
                                                : (isTurkish ? 'Paper İşlemi Onayla' : 'Approve Paper Trade')}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <BarChart3 className="w-3 h-3" />
                            <span>{isTurkish ? 'Piyasa Sinyali' : 'Sentiment'}: {marketSentiment}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <TrendingUp className="w-3 h-3" />
                            <span>{isTurkish ? 'Varlık' : 'Asset'}: {selectedAsset}</span>
                        </div>
                    </div>
                    <span>ID: AGENT-RX-72</span>
                </div>
            </div>
        </motion.div>
    );
}
