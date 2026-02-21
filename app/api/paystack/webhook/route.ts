import { NextResponse, type NextRequest } from "next/server";
import { validateWebhookSignature, verifyTransaction, fromPaystackAmount } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/service";
import { sendDonationReceipt } from "@/lib/resend";

// Disable body parsing — we need raw body for signature verification
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const rawBody  = await request.text();
  const signature = request.headers.get("x-paystack-signature") ?? "";

  // ── Verify webhook signature ────────────────────────────────
  if (!validateWebhookSignature(rawBody, signature)) {
    console.error("Invalid Paystack webhook signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, unknown> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceClient();

  // ── Handle charge.success ───────────────────────────────────
  if (event.event === "charge.success") {
    const data = event.data as {
      reference:  string;
      amount:     number;
      currency:   string;
      customer:   { email: string; first_name?: string; last_name?: string };
      metadata:   {
        campaign_id?:       string;
        campaign_slug?:     string;
        donor_name?:        string;
        is_recurring?:      boolean;
        newsletter_opt_in?: boolean;
      };
      plan?: string;
    };

    const reference  = data.reference;
    const ngnAmount  = fromPaystackAmount(data.amount);
    const meta       = data.metadata ?? {};
    const amount     = (meta as Record<string, unknown>).original_amount as number ?? ngnAmount;
    const currency   = (meta as Record<string, unknown>).original_currency as string ?? data.currency;
    const email      = data.customer.email;
    const donorName  = meta.donor_name
      ?? [data.customer.first_name, data.customer.last_name].filter(Boolean).join(" ")
      ?? null;
    const isRecurring     = meta.is_recurring     ?? !!data.plan;
    const newsletterOptIn = meta.newsletter_opt_in ?? false;
    const campaignId      = meta.campaign_id      ?? null;

    // ── Idempotency check — skip if already processed ──────────
    const { data: existing } = await supabase
      .from("donations")
      .select("id")
      .eq("paystack_ref", reference)
      .single();

    if (existing) {
      return NextResponse.json({ received: true, skipped: "duplicate" });
    }

    // ── Fetch campaign title for receipt ───────────────────────
    let campaignTitle: string | null = null;
    let campaignSlug:  string | null = meta.campaign_slug ?? null;

    if (campaignId) {
      const { data: campaign } = await supabase
        .from("campaigns")
        .select("title, slug")
        .eq("id", campaignId)
        .single();
      campaignTitle = campaign?.title ?? null;
      campaignSlug  = campaign?.slug  ?? campaignSlug;
    }

    // ── Insert donation record ──────────────────────────────────
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        campaign_id:       campaignId,
        paystack_ref:      reference,
        paystack_plan_id:  data.plan ?? null,
        donor_name:        donorName,
        donor_email:       email,
        amount,
        currency,
        is_recurring:      isRecurring,
        status:            "completed",
        newsletter_opt_in: newsletterOptIn,
        metadata:          JSON.parse(JSON.stringify(data)),
      })
      .select()
      .single();

    if (donationError) {
      console.error("Failed to insert donation:", donationError.message);
      return NextResponse.json({ error: "DB insert failed" }, { status: 500 });
    }

    // ── Insert campaign contribution (triggers progress update) ─
    if (campaignId) {
      const { error: contribError } = await supabase
        .from("campaign_contributions")
        .insert({
          campaign_id:  campaignId,
          amount,
          currency,
          source:       "paystack",
          donor_name:   donorName,
          donor_email:  email,
          paystack_ref: reference,
        });

      if (contribError) {
        console.error("Failed to insert contribution:", contribError.message);
        // Non-fatal — donation is recorded, just progress won't update
      }
    }

    // ── Add to newsletter if opted in ──────────────────────────
    if (newsletterOptIn && email) {
      await supabase
        .from("newsletter_subscribers")
        .upsert(
          { email, name: donorName ?? undefined, source: "donate", subscribed: true },
          { onConflict: "email", ignoreDuplicates: true }
        );
    }

    // ── Send donation receipt via Resend ───────────────────────
    if (email) {
      try {
        await sendDonationReceipt({
          to:            email,
          donorName,
          amount,
          currency,
          campaignTitle,
          campaignSlug,
          reference,
          isRecurring,
        });

        // Mark receipt as sent
        await supabase
          .from("donations")
          .update({ receipt_sent: true })
          .eq("id", donation.id);
      } catch (emailError) {
        console.error("Failed to send receipt:", emailError);
        // Non-fatal — donation is still recorded
      }
    }

    return NextResponse.json({ received: true });
  }

  // ── Handle subscription events (recurring) ──────────────────
  if (event.event === "subscription.create") {
    // Subscription created — the first charge.success handles the payment
    // Additional logic can go here if needed
    return NextResponse.json({ received: true });
  }

  // ── Acknowledge other events ────────────────────────────────
  return NextResponse.json({ received: true });
}