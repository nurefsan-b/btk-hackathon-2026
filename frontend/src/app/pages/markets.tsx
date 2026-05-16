import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, TrendingUp, Newspaper, ShieldAlert, Loader2, CheckCircle2 } from 'lucide-react';
import { ConnectionBanner } from '../components/connection-banner';
import { useAuth } from '../lib/auth-context';
import {
  createPaperTrade,
  getAssetResearch,
  getMarketAssets,
  type AssetResearchResponse,
  type MarketAsset,
} from '../lib/api';

const recommendationLabels = {
  paper_buy: 'Paper Buy Signal',
  watch: 'Watch',
  hold: 'Hold',
};

export function Markets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('BIST100');
  const [query, setQuery] = useState('');
  const [research, setResearch] = useState<AssetResearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isOpeningTrade, setIsOpeningTrade] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const userId = user?.id || 'user_demo';

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) =>
      `${asset.symbol} ${asset.name} ${asset.assetType}`.toLowerCase().includes(normalized),
    );
  }, [assets, query]);

  const loadResearch = useCallback(async (symbol: string) => {
    setIsAnalyzing(true);
    setMessage(null);
    try {
      setResearch(await getAssetResearch(symbol));
      setSelectedSymbol(symbol);
      setIsBackendOnline(true);
    } catch (err) {
      console.error('Asset research load error:', err);
      setIsBackendOnline(false);
      setMessage('Asset research is unavailable right now.');
    } finally {
      setIsAnalyzing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const assetData = await getMarketAssets();
        setAssets(assetData);
        setIsBackendOnline(true);
        await loadResearch(assetData[0]?.symbol ?? 'BIST100');
      } catch (err) {
        console.error('Market assets load error:', err);
        setIsBackendOnline(false);
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, [loadResearch]);

  const openPaperTrade = async () => {
    if (!research) return;
    setIsOpeningTrade(true);
    setMessage(null);
    try {
      await createPaperTrade({
        user_id: userId,
        asset: research.asset,
        confidence_score: research.confidenceScore,
        reasoning: research.aiSummary,
      });
      setMessage(`Opened a ${research.asset} paper position from pending savings.`);
    } catch (err) {
      console.error('Paper trade error:', err);
      setMessage('Paper trade could not be opened. Check pending savings first.');
    } finally {
      setIsOpeningTrade(false);
    }
  };

  if (isLoading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground animate-pulse">Loading markets...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
            Markets
          </h1>
          <p className="text-muted-foreground mt-1">
            Asset research, live quotes, news context, and AI paper-trade signals
          </p>
        </div>

        <ConnectionBanner isOnline={isBackendOnline} />

        <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
          <section className="rounded-2xl bg-card border border-border p-5">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search assets"
                className="w-full bg-input-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
              />
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredAssets.map((asset) => (
                <button
                  key={asset.symbol}
                  onClick={() => loadResearch(asset.symbol)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedSymbol === asset.symbol
                      ? 'bg-secondary/15 border-secondary/50'
                      : 'bg-muted/20 border-border/50 hover:bg-muted/30'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{asset.symbol}</p>
                      <p className="text-xs text-muted-foreground mt-1">{asset.name}</p>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-secondary">
                      {asset.assetType}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            {research && (
              <>
                <div className="rounded-2xl bg-card border border-border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">{research.name}</p>
                      <h2 className="text-3xl mt-1">{research.asset}</h2>
                      <div className="flex items-end gap-3 mt-4">
                        <span className="text-4xl font-semibold">
                          {research.price.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground mb-1">{research.currency}</span>
                        <span
                          className={`mb-1 text-sm ${
                            (research.changePercent ?? 0) >= 0 ? 'text-[#00ff88]' : 'text-red-400'
                          }`}
                        >
                          {(research.changePercent ?? 0) >= 0 ? '+' : ''}
                          {(research.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[360px]">
                      <Metric label="Previous" value={research.previousClose?.toFixed(2) ?? '-'} />
                      <Metric label="Volume" value={research.volume?.toLocaleString() ?? '-'} />
                      <Metric label="Risk" value={research.riskLevel} />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-card border border-border p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-[#00ff88]" />
                        <h3 className="text-lg">AI Market Signal</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
                        {research.aiSummary}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/25 border border-border/50 p-4 min-w-[240px]">
                      <p className="text-xs text-muted-foreground">Recommendation</p>
                      <p className="text-lg mt-1">{recommendationLabels[research.recommendation]}</p>
                      <p className="text-xs text-[#00ff88] mt-2">
                        Confidence {Math.round(research.confidenceScore * 100)}%
                      </p>
                      <button
                        onClick={openPaperTrade}
                        disabled={isOpeningTrade || research.recommendation === 'hold'}
                        className="mt-4 w-full bg-gradient-to-r from-[#00ff88] to-[#14b8a6] text-[#0a0e27] px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40 disabled:grayscale"
                      >
                        {isOpeningTrade ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span className="text-sm font-bold">Open Paper Position</span>
                      </button>
                    </div>
                  </div>
                  {message && <p className="text-xs text-muted-foreground mt-4">{message}</p>}
                </div>

                <div className="rounded-2xl bg-card border border-border p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <Newspaper className="w-5 h-5 text-secondary" />
                    <h3 className="text-lg">Symbol-Specific News</h3>
                  </div>
                  <div className="space-y-3">
                    {research.news.map((item) => (
                      <article key={`${item.source}-${item.title}`} className="p-4 rounded-xl bg-muted/20 border border-border/50">
                        <div className="flex items-start gap-3">
                          <ShieldAlert className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="text-sm">{item.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {item.description || 'No description available.'}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-2">
                              {item.source} · {item.publishedAt}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/25 border border-border/50 p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm mt-1 truncate">{value}</p>
    </div>
  );
}
