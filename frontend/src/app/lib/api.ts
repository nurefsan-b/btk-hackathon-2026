/**
 * MicroFon — Centralized API Client
 *
 * All backend communication goes through this module.
 * In production the base URL would come from an env variable;
 * during local Docker development Traefik routes everything through port 80.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";
const TOKEN_KEY = "microfon_access_token";

// ─── Helpers ────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api/v1${path}`;
  const token = getAccessToken();
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, extractErrorMessage(body) || res.statusText);
  }
  return res.json() as Promise<T>;
}

function extractErrorMessage(body: string): string {
  if (!body) return "";
  try {
    const parsed = JSON.parse(body) as { detail?: unknown };
    return typeof parsed.detail === "string" ? parsed.detail : body;
  } catch {
    return body;
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── Types ──────────────────────────────────────────────────

export interface TransactionPayload {
  user_id: string;
  amount: number;
  merchant: string;
  description?: string;
  currency?: string;
}

export interface TransactionResponse {
  id: string;
  user_id: string;
  amount: number;
  rounded_amount: number;
  round_up_diff: number;
  merchant: string | null;
  description: string | null;
  currency: string;
  created_at: string;
}

export interface SavingsSummary {
  user_id: string;
  total_pending: number;
  total_invested: number;
  savings: WeeklySaving[];
}

export interface WeeklySaving {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  total_amount: number;
  status: string;
}

export interface TradeResponse {
  id: string;
  user_id: string;
  action: string;
  asset: string;
  amount_invested: number;
  confidence_score: number;
  reasoning: string;
  status: string;
  executed_price: number | null;
  profit_loss: number | null;
  created_at: string;
  executed_at: string | null;
}

export interface TriggerTradeResult {
  task_id: string;
  status: string;
}

export interface SentimentInsight {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  sentiment_score: number;
  ai_conclusion: string;
}

export interface ReasoningStep {
  step: number;
  title: string;
  description: string;
  status: "completed" | "active" | "pending";
}

export interface BrainMetrics {
  articles_analyzed: number;
  market_sentiment: string;
  is_scanning: boolean;
  active_sources: number;
}

export interface AIInsightsResponse {
  generated_at: string;
  brain_metrics: BrainMetrics;
  sentiment_feed: SentimentInsight[];
  reasoning_steps: ReasoningStep[];
}

export interface AdvisorDiscovery {
  id: string;
  text: string;
  type: "analysis" | "sentiment" | "opportunity";
}

export interface AIAdvisorResponse {
  generated_at: string;
  asset: "BIST100" | "XAU" | "USD" | "EUR" | "BTC";
  action: "buy" | "sell" | "hold";
  confidence_score: number;
  risk_level: string;
  expected_return_label: string;
  market_sentiment: string;
  recommendation: string;
  discoveries: AdvisorDiscovery[];
}

export interface AnalyticsResponse {
  generated_at: string;
  kpis: {
    prediction_accuracy: number;
    accuracy_trend: string;
    total_roundups: number;
    roundups_trend: string;
    next_month_forecast: number;
    forecast_change: string;
  };
  sentiment_correlation: Array<{
    date: string;
    sentiment: number;
    growth: number;
  }>;
  spare_change_sources: Array<{
    name: string;
    value: number;
    amount: number;
    color: string;
  }>;
  market_alerts: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
  }>;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  assetType: string;
  currency: string;
}

export interface MarketNewsItem {
  title: string;
  description: string;
  source: string;
  publishedAt: string;
}

export interface AssetResearchResponse {
  asset: string;
  name: string;
  price: number;
  currency: string;
  previousClose: number | null;
  changePercent: number | null;
  volume: number | null;
  news: MarketNewsItem[];
  aiSummary: string;
  recommendation: "watch" | "paper_buy" | "hold";
  confidenceScore: number;
  riskLevel: string;
  generatedAt: string;
}

export interface ApiUser {
  id: string;
  email: string;
  full_name: string;
  risk_profile: "low" | "medium" | "high";
  auth_provider: string;
  avatar_url: string | null;
  is_2fa_enabled: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string | null;
  token_type: "bearer";
  user: ApiUser;
  requires_2fa?: boolean;
  two_factor_token?: string | null;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getGoogleLoginUrl(): string {
  return `${API_BASE}/api/v1/auth/google/login`;
}

// ─── API Functions ──────────────────────────────────────────

/** POST /transactions/ — simulate a bank purchase */
export function createTransaction(payload: TransactionPayload) {
  return request<TransactionResponse>("/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginWithPassword(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verify2FA(twoFactorToken: string, code: string) {
  return request<AuthResponse>("/auth/verify-2fa", {
    method: "POST",
    body: JSON.stringify({ two_factor_token: twoFactorToken, code }),
  });
}

export function registerWithPassword(
  fullName: string,
  email: string,
  password: string,
  riskProfile: "low" | "medium" | "high",
) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      full_name: fullName,
      email,
      password,
      risk_profile: riskProfile,
    }),
  });
}

export function getCurrentUser() {
  return request<ApiUser>("/auth/me");
}

/** GET /transactions/{userId} — fetch recent transactions */
export function getTransactions(userId: string, limit = 50) {
  return request<TransactionResponse[]>(
    `/transactions/${userId}?limit=${limit}`,
  );
}

/** GET /savings/{userId} — fetch savings summary (pending + invested) */
export function getSavingsSummary(userId: string) {
  return request<SavingsSummary>(`/savings/${userId}`);
}

/** POST /savings/{userId}/accumulate — manually trigger weekly roll-up */
export function triggerAccumulation(userId: string) {
  return request<{ saving_id?: string; total_amount?: number; message?: string }>(
    `/savings/${userId}/accumulate`,
    { method: "POST" },
  );
}

/** POST /trades/trigger — dispatch the AI paper-trading agent */
export function triggerAITrade(userId: string, savingId?: string) {
  return request<TriggerTradeResult>("/trades/trigger", {
    method: "POST",
    body: JSON.stringify({ user_id: userId, saving_id: savingId ?? null }),
  });
}

/** GET /trades/{userId} — fetch trade history */
export function getTradeHistory(userId: string, limit = 20) {
  return request<TradeResponse[]>(`/trades/${userId}?limit=${limit}`);
}

export function getAIInsights(userId: string) {
  return request<AIInsightsResponse>(`/ai/insights/${userId}`);
}

export function getAIAdvisor(userId: string) {
  return request<AIAdvisorResponse>(`/ai/advisor/${userId}`);
}

export function getAnalytics(userId: string) {
  return request<AnalyticsResponse>(`/analytics/${userId}`);
}

export function getMarketAssets() {
  return request<MarketAsset[]>("/market/assets");
}

export function getAssetResearch(symbol: string) {
  return request<AssetResearchResponse>(`/market/research/${encodeURIComponent(symbol)}`);
}

export function createPaperTrade(payload: {
  user_id: string;
  asset: string;
  amount?: number;
  confidence_score: number;
  reasoning: string;
}) {
  return request<TradeResponse>("/trades/paper", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return request<{ message: string }>("/users/me/change-password", {
    method: "POST",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export function updateCurrentUser(payload: {
  full_name?: string;
  email?: string;
  risk_profile?: "low" | "medium" | "high";
}) {
  return request<ApiUser>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function toggle2FA(enabled: boolean) {
  return request<ApiUser>("/users/me/2fa/toggle", {
    method: "POST",
    body: JSON.stringify({ enabled }),
  });
}

/** Health check — useful for showing connection status */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── SSE Task Watcher ────────────────────────────────────────

export type TaskWatcherOptions = {
  /** Called when the Celery task completes successfully */
  onComplete: (data: Record<string, unknown>) => void;
  /** Called on task failure, timeout, or SSE connection error */
  onError?: (reason: string) => void;
};

/**
 * Opens a Server-Sent Events connection to watch a Celery task.
 *
 * Replaces the `window.setTimeout(loadData, 2500)` pattern.
 * The backend emits one of three terminal events:
 *   - trade_done    → task SUCCESS  → calls onComplete()
 *   - trade_error   → task FAILURE  → calls onError()
 *   - trade_timeout → 5-min timeout → calls onError()
 *
 * @returns A cleanup function — call it to abort the stream early (e.g. on unmount).
 *
 * @example
 * const cleanup = watchTaskStatus(taskId, {
 *   onComplete: () => loadData(),
 *   onError: (msg) => console.error(msg),
 * });
 * // Later, if needed:
 * cleanup();
 */
export function watchTaskStatus(
  taskId: string,
  { onComplete, onError }: TaskWatcherOptions,
): () => void {
  const url = `${API_BASE}/api/v1/trades/status/${encodeURIComponent(taskId)}/stream`;
  const source = new EventSource(url);

  source.addEventListener("trade_done", (e: MessageEvent) => {
    source.close();
    try {
      const data = JSON.parse(e.data) as Record<string, unknown>;
      onComplete(data);
    } catch {
      onComplete({});
    }
  });

  source.addEventListener("trade_error", (e: MessageEvent) => {
    source.close();
    try {
      const data = JSON.parse(e.data) as { error?: string };
      onError?.(data.error ?? "Trade failed");
    } catch {
      onError?.("Trade failed");
    }
  });

  source.addEventListener("trade_timeout", () => {
    source.close();
    onError?.("AI agent timed out — please refresh the page.");
  });

  source.onerror = () => {
    source.close();
    onError?.("Connection lost while waiting for the AI agent.");
  };

  // Return a cleanup function for use in React useEffect
  return () => {
    source.close();
  };
}
