import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Loader2,
  Newspaper,
  Search,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import { ConnectionBanner } from '../components/connection-banner';
import { useRequireAuth } from '../lib/use-require-auth';
import {
  createPaperTrade,
  getAssetResearch,
  getMarketAssets,
  type AssetResearchResponse,
  type MarketAsset,
} from '../lib/api';

const recommendationLabels: Record<string, { en: string; tr: string }> = {
  paper_buy: { en: 'Paper Buy Signal', tr: 'Paper Alım Sinyali' },
  watch: { en: 'Watch', tr: 'İzleme Listesi' },
  hold: { en: 'Hold', tr: 'Bekleme' },
};

export function Markets() {
  const { symbol } = useParams();

  return symbol ? <MarketDetail symbol={symbol} /> : <MarketGrid />;
}

function MarketGrid() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const filteredAssets = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return assets;
    return assets.filter((asset) =>
      `${asset.symbol} ${asset.name} ${asset.assetType}`.toLowerCase().includes(normalized),
    );
  }, [assets, query]);

  useEffect(() => {
    async function loadAssets() {
      try {
        setAssets(await getMarketAssets());
        setIsBackendOnline(true);
      } catch (err) {
        console.error('Market assets load error:', err);
        setIsBackendOnline(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadAssets();
  }, []);

  if (isLoading) {
    return <MarketLoading label={isTurkish ? 'Piyasalar yükleniyor...' : 'Loading markets...'} />;
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          title={t('markets.title')}
          description={t('markets.subtitle')}
        />

        <ConnectionBanner isOnline={isBackendOnline} />

        <section className="rounded-2xl bg-card border border-border p-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={isTurkish ? 'Sembol, şirket veya varlık türü ara...' : 'Search symbol, company, asset type'}
              className="w-full bg-input-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredAssets.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => navigate(`/markets/${encodeURIComponent(asset.symbol)}`)}
              className="group min-h-[150px] text-left rounded-2xl bg-card border border-border p-5 hover:border-secondary/60 hover:bg-muted/20 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{asset.symbol}</p>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{asset.name}</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                  <ArrowUpRight className="w-4 h-4 text-secondary" />
                </div>
              </div>

              <div className="flex items-center justify-between mt-7">
                <span className="text-[10px] uppercase tracking-wider text-secondary">
                  {asset.assetType === 'Crypto' && isTurkish ? 'Kripto' : 
                   asset.assetType === 'Commodity' && isTurkish ? 'Emtia' : asset.assetType}
                </span>
                <span className="text-xs text-muted-foreground">{asset.currency}</span>
              </div>
            </button>
          ))}
        </section>
      </div>
    </main>
  );
}

function MarketDetail({ symbol }: { symbol: string }) {
  const navigate = useNavigate();
  const user = useRequireAuth();
  const { t, i18n } = useTranslation();
  const isTurkish = i18n.language.startsWith('tr');

  const [research, setResearch] = useState<AssetResearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningTrade, setIsOpeningTrade] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean | null>(null);

  const userId = user.id;

  const translateAISummary = (summary: string) => {
    if (!isTurkish) return summary;
    if (summary.includes('market sentiment is constructive')) {
      return 'BIST100 için piyasa sinyalleri yapıcı görünüyor. AI Danışman dengeli bir dağılım öneriyor.';
    }
    if (summary.includes('market sentiment is bullish')) {
      return 'Altın (XAU) için piyasa duyarlılığı oldukça olumlu. Güçlü bir alım sinyali mevcut.';
    }
    if (summary.includes('market sentiment is bearish')) {
      return 'Kripto piyasasında risk sinyalleri algılandı. AI Danışman temkinli olmayı ve beklemede kalmayı öneriyor.';
    }
    return summary;
  };

  const translateNewsDescription = (desc: string) => {
    if (!isTurkish || !desc) return desc;
    if (desc.includes('positive market close')) {
      return 'Pozitif piyasa kapanışının ardından BIST100 endeksinde yukarı yönlü hareket beklentisi artıyor.';
    }
    if (desc.includes('global risk appetite')) {
      return 'Küresel piyasalardaki risk iştahı değişikliklerine paralel olarak altın fiyatları yatay seyrini sürdürüyor.';
    }
    return desc;
  };

  const translateNewsTitle = (title: string) => {
    if (!isTurkish) return title;
    if (title.includes('BIST100 momentum improves')) {
      return 'Pozitif Kapanış Sonrası BIST100 İvmesi Güçleniyor';
    }
    if (title.includes('Gold steadies')) {
      return 'Küresel Risk İştahındaki Dalgalanmalarla Altın Dengeleniyor';
    }
    return title;
  };

  const loadResearch = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      setResearch(await getAssetResearch(symbol));
      setIsBackendOnline(true);
    } catch (err) {
      console.error('Asset research load error:', err);
      setResearch(null);
      setIsBackendOnline(false);
      setMessage(isTurkish ? 'Varlık araştırmasına şu an erişilemiyor.' : 'Asset research is unavailable right now.');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, isTurkish]);

  useEffect(() => {
    loadResearch();
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
      setMessage(
        isTurkish 
          ? `Birikim havuzundan ${research.asset} için manuel paper işlem açıldı.` 
          : `Opened a ${research.asset} paper position from pending savings.`
      );
    } catch (err) {
      console.error('Paper trade error:', err);
      setMessage(
        isTurkish 
          ? 'Paper işlem açılamadı. Lütfen önce birikim havuzunda yeterli bakiye olduğundan emin olun.' 
          : 'Paper trade could not be opened. Check pending savings first.'
      );
    } finally {
      setIsOpeningTrade(false);
    }
  };

  if (isLoading) {
    return <MarketLoading label={isTurkish ? `${symbol} yükleniyor...` : `Loading ${symbol}...`} />;
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/markets')}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isTurkish ? 'Piyasalara Geri Dön' : 'Back to markets'}</span>
        </button>

        <ConnectionBanner isOnline={isBackendOnline} />

        {!research ? (
          <div className="rounded-2xl bg-card border border-border p-8">
            <p className="text-sm text-muted-foreground">
              {message ?? (isTurkish ? 'Varlık detayları mevcut değil.' : 'Asset detail unavailable.')}
            </p>
          </div>
        ) : (
          <>
            <section className="rounded-2xl bg-card border border-border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">{research.name}</p>
                  <h1 className="text-4xl mt-1">{research.asset}</h1>
                  <div className="flex items-end gap-3 mt-5">
                    <span className="text-5xl font-semibold">{research.price.toFixed(2)}</span>
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

                <div className="grid grid-cols-3 gap-3 min-w-full lg:min-w-[420px]">
                  <Metric label={isTurkish ? 'Önceki Kapanış' : 'Previous'} value={research.previousClose?.toFixed(2) ?? '-'} />
                  <Metric label={isTurkish ? 'Hacim' : 'Volume'} value={research.volume?.toLocaleString() ?? '-'} />
                  <Metric label={isTurkish ? 'Risk' : 'Risk'} value={
                    isTurkish 
                      ? (research.riskLevel === 'High' ? 'Yüksek' : research.riskLevel === 'Medium' ? 'Orta' : 'Düşük')
                      : research.riskLevel
                  } />
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-card border border-border p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-[#00ff88]" />
                    <h2 className="text-lg">{isTurkish ? 'AI Piyasa Sinyali' : 'AI Market Signal'}</h2>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-3xl">
                    {translateAISummary(research.aiSummary)}
                  </p>
                </div>

                <div className="rounded-xl bg-muted/25 border border-border/50 p-4 min-w-[250px]">
                  <p className="text-xs text-muted-foreground">{isTurkish ? 'Öneri' : 'Recommendation'}</p>
                  <p className="text-lg mt-1">
                    {isTurkish ? recommendationLabels[research.recommendation]?.tr : recommendationLabels[research.recommendation]?.en}
                  </p>
                  <p className="text-xs text-[#00ff88] mt-2">
                    {isTurkish ? 'Güven Derecesi' : 'Confidence'} {Math.round(research.confidenceScore * 100)}%
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
                    <span className="text-sm font-bold">{isTurkish ? 'Paper Sinyali Onayla' : 'Open Paper Position'}</span>
                  </button>
                </div>
              </div>
              {message && <p className="text-xs text-muted-foreground mt-4">{message}</p>}
            </section>

            <section className="rounded-2xl bg-card border border-border p-6">
              <div className="flex items-center gap-2 mb-5">
                <Newspaper className="w-5 h-5 text-secondary" />
                <h2 className="text-lg">{isTurkish ? 'Sembole Özel Haberler' : 'Symbol-Specific News'}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {research.news.map((item) => (
                  <article key={`${item.source}-${item.title}`} className="p-4 rounded-xl bg-muted/20 border border-border/50">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-secondary mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm">{translateNewsTitle(item.title)}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {translateNewsDescription(item.description) || (isTurkish ? 'Haber açıklaması bulunmuyor.' : 'No description available.')}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {item.source} · {item.publishedAt}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function PageHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl tracking-tight bg-gradient-to-r from-[#00ff88] to-[#8b5cf6] bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

function MarketLoading({ label }: { label: string }) {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground animate-pulse">{label}</p>
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
