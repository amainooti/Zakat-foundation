import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendDonationReceipt } from "@/lib/resend";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  const { donationId } = await request.json();
  if (!donationId) return NextResponse.json({ error: "donationId required" }, { status: 400 });

  const service = createServiceClient();

  const { data: donation, error } = await service
    .from("donations")
    .select("*, campaigns(title, slug)")
    .eq("id", donationId)
    .single();

  if (error || !donation) {
    return NextResponse.json({ error: "Donation not found" }, { status: 404 });
  }

  if (!donation.donor_email) {
    return NextResponse.json({ error: "No email on record for this donation" }, { status: 400 });
  }

  try {
    await sendDonationReceipt({
      to:            donation.donor_email,
      donorName:     donation.donor_name,
      amount:        donation.amount,
      currency:      donation.currency,
      campaignTitle: donation.campaigns?.title ?? null,
      campaignSlug:  donation.campaigns?.slug  ?? null,
      reference:     donation.paystack_ref,
      isRecurring:   donation.is_recurring,
    });

    await service
      .from("donations")
      .update({ receipt_sent: true })
      .eq("id", donationId);

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Resend receipt error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to send" },
      { status: 500 }
    );
  }
}