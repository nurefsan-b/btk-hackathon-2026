/**
 * Küsürat-AI — Centralized API Client
 *
 * All backend communication goes through this module.
 * In production the base URL would come from an env variable;
 * during local Docker development Traefik routes everything through port 80.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? "http://api.localhost";

// ─── Helpers ────────────────────────────────────────────────

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api/v1${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApiError(res.status, body || res.statusText);
  }
  return res.json() as Promise<T>;
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

// ─── API Functions ──────────────────────────────────────────

/** POST /transactions/ — simulate a bank purchase */
export function createTransaction(payload: TransactionPayload) {
  return request<TransactionResponse>("/transactions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
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

/** Health check — useful for showing connection status */
export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch {
    return false;
  }
}
