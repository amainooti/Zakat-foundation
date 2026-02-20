import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CampaignForm from "@/components/admin/CampaignForm";
import ProgressLogger from "@/components/admin/ProgressLogger";
import { formatCurrency } from "@/lib/utils";
import { calcProgress } from "@/lib/utils";
import type { Campaign, CampaignContribution } from "@/lib/types/app";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: campaign }, { data: contributions }] = await Promise.all([
    supabase.from("campaigns").select("*").eq("id", id).single(),
    supabase
      .from("campaign_contributions")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  if (!campaign) notFound();

  const pct = calcProgress(campaign.raised_amount, campaign.target_amount);

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-title">Edit Campaign</h1>
        <p className="admin-page-subtitle">{campaign.title}</p>
      </div>

      {/* Progress summary */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{ background: "#161616", border: "1px solid #2A2A2A" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "4px" }}>
                Raised
              </p>
              <p style={{ fontSize: "20px", fontWeight: 600, color: "#F0EDE8", fontFamily: "monospace" }}>
                {formatCurrency(campaign.raised_amount)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "4px" }}>
                Target
              </p>
              <p style={{ fontSize: "20px", fontWeight: 600, color: "#706B63", fontFamily: "monospace" }}>
                {formatCurrency(campaign.target_amount)}
              </p>
            </div>
            <div>
              <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "4px" }}>
                Donors
              </p>
              <p style={{ fontSize: "20px", fontWeight: 600, color: "#F0EDE8", fontFamily: "monospace" }}>
                {campaign.donor_count}
              </p>
            </div>
          </div>
          <p style={{ fontSize: "28px", fontWeight: 700, color: "#C9952A", fontFamily: "monospace" }}>
            {pct}%
          </p>
        </div>
        {/* Progress bar */}
        <div style={{ height: "5px", background: "#2A2A2A", borderRadius: 99, overflow: "hidden" }}>
          <div
            style={{
              height: "100%", width: `${pct}%`,
              background: "linear-gradient(90deg, #7A5A1A, #C9952A)",
              borderRadius: 99, transition: "width 1s ease",
            }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
        {/* Campaign form */}
        <CampaignForm campaign={campaign as Campaign} />

        {/* Contribution logger */}
        <ProgressLogger
          campaignId={campaign.id}
          contributions={(contributions ?? []) as CampaignContribution[]}
        />
      </div>
    </div>
  );
}