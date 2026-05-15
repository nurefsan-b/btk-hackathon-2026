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

/** POST /trades/trigger — dispatch the AI trading agent */
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
