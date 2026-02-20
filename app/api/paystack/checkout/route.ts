import { NextResponse, type NextRequest } from "next/server";
import { initializeTransaction, toPaystackAmount } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";

// ── Currency handling ─────────────────────────────────────────
// Paystack accounts are activated per-currency.
// Default is NGN. USD/GBP etc. require explicit activation in
// your Paystack dashboard under Settings > Account Details.
//
// For now we send NGN. To accept USD natively, contact Paystack
// to enable multi-currency on your account.
//
// USD → NGN approximate rate (update periodically or use a live rate API)
const USD_TO_NGN = 1600;

function toNGN(amount: number, currency: string): number {
  if (currency === "NGN") return amount;
  if (currency === "USD") return Math.round(amount * USD_TO_NGN);
  if (currency === "GBP") return Math.round(amount * USD_TO_NGN * 1.27);
  if (currency === "EUR") return Math.round(amount * USD_TO_NGN * 1.08);
  // Default: treat as USD
  return Math.round(amount * USD_TO_NGN);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      email,
      amount,
      currency = "USD",
      campaign_id,
      campaign_slug,
      donor_name,
      is_recurring,
      plan_code,
      newsletter_opt_in = false,
    } = body;

    if (!email || !amount) {
      return NextResponse.json(
        { error: "Email and amount are required" },
        { status: 400 }
      );
    }

    if (amount < 1) {
      return NextResponse.json(
        { error: "Minimum donation is $1" },
        { status: 400 }
      );
    }

    if (campaign_id) {
      const supabase = createServiceClient();
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("id, status")
        .eq("id", campaign_id)
        .single();

      if (!campaign || campaign.status === "archived") {
        return NextResponse.json(
          { error: "Campaign not found or no longer active" },
          { status: 404 }
        );
      }
    }

    const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const ngnAmount   = toNGN(amount, currency.toUpperCase());

    const transaction = await initializeTransaction({
      email,
      amount:       toPaystackAmount(ngnAmount), // Paystack expects kobo
      currency:     "NGN",
      callback_url: campaign_slug
        ? `${siteUrl}/campaigns/${campaign_slug}?donated=true`
        : `${siteUrl}/donate?donated=true`,
      ...(is_recurring && plan_code ? { plan: plan_code } : {}),
      metadata: {
        campaign_id:        campaign_id    ?? null,
        campaign_slug:      campaign_slug  ?? null,
        donor_name:         donor_name     ?? null,
        original_amount:    amount,           // store original for receipt
        original_currency:  currency,
        is_recurring:       is_recurring   ?? false,
        newsletter_opt_in:  newsletter_opt_in,
      },
      channels: ["card", "bank", "ussd", "mobile_money", "bank_transfer"],
    });

    return NextResponse.json({
      authorization_url: transaction.authorization_url,
      reference:         transaction.reference,
    });
  } catch (error: unknown) {
    console.error("Paystack checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to initialize payment" },
      { status: 500 }
    );
  }
}