// ============================================================
// Paystack helper — server-side only
// Docs: https://paystack.com/docs/api
// ============================================================

const PAYSTACK_BASE = "https://api.paystack.co";

function paystackHeaders() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function paystackFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      ...paystackHeaders(),
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json();

  if (!res.ok || !data.status) {
    throw new Error(data.message ?? `Paystack error: ${res.status}`);
  }

  return data.data as T;
}

// ── Types ─────────────────────────────────────────────────────
export interface InitializeParams {
  email:       string;
  amount:      number;         // in KOBO (NGN) or lowest currency unit — see note below
  currency?:   string;         // default: NGN — use USD/GBP etc. if multicurrency enabled
  reference?:  string;
  callback_url?: string;
  metadata?: {
    campaign_id?:      string;
    campaign_slug?:    string;
    donor_name?:       string;
    is_recurring?:     boolean;
    newsletter_opt_in?: boolean;
    [key: string]: unknown;
  };
  plan?: string;               // plan code for recurring
  channels?: string[];         // ['card', 'bank', 'ussd', 'mobile_money']
}

export interface PaystackTransaction {
  authorization_url: string;
  access_code:       string;
  reference:         string;
}

export interface VerifiedTransaction {
  id:        number;
  reference: string;
  status:    "success" | "failed" | "abandoned";
  amount:    number;           // in kobo
  currency:  string;
  customer: {
    email:      string;
    first_name: string | null;
    last_name:  string | null;
  };
  metadata:  Record<string, unknown>;
  plan?:     string;
}

export interface PaystackPlan {
  plan_code:    string;
  name:         string;
  amount:       number;
  interval:     string;
  currency:     string;
}

// ── Initialize a transaction (returns checkout URL) ───────────
export async function initializeTransaction(
  params: InitializeParams
): Promise<PaystackTransaction> {
  return paystackFetch<PaystackTransaction>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Verify a transaction by reference ────────────────────────
export async function verifyTransaction(
  reference: string
): Promise<VerifiedTransaction> {
  return paystackFetch<VerifiedTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  );
}

// ── Create a recurring plan (monthly giving) ─────────────────
export async function createPlan(params: {
  name:     string;
  amount:   number;           // in lowest currency unit
  interval: "monthly" | "quarterly" | "annually";
  currency?: string;
}): Promise<PaystackPlan> {
  return paystackFetch<PaystackPlan>("/plan", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

// ── Fetch all plans ───────────────────────────────────────────
export async function listPlans(): Promise<PaystackPlan[]> {
  return paystackFetch<PaystackPlan[]>("/plan");
}

// ── Validate Paystack webhook signature ───────────────────────
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  // Paystack signs webhooks with HMAC-SHA512
  const crypto = require("crypto"); // eslint-disable-line @typescript-eslint/no-require-imports
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(payload)
    .digest("hex");
  return hash === signature;
}

// ── Convert amount to Paystack unit ──────────────────────────
// Paystack expects amounts in the smallest currency unit:
//   NGN → kobo   (multiply by 100)
//   USD → cents  (multiply by 100)
//   GBP → pence  (multiply by 100)
export function toPaystackAmount(amount: number): number {
  return Math.round(amount * 100);
}

// ── Convert from Paystack unit to decimal ────────────────────
export function fromPaystackAmount(amount: number): number {
  return amount / 100;
}