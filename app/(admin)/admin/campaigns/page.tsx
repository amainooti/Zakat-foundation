import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus } from "lucide-react";
import type { Campaign, CampaignStatus } from "@/lib/types/app";
import CampaignStatusBadge from "@/components/admin/CampaignStatusBadge";

export default async function CampaignsPage() {
  const supabase = await createClient();

  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) console.error("Failed to fetch campaigns:", error.message);

  return (
    <div>
      <style>{`.admin-table-row:hover { background: #1A1A1A; }`}</style>

      <div className="admin-page-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <h1 className="admin-page-title">Campaigns</h1>
          <p className="admin-page-subtitle">{campaigns?.length ?? 0} total campaigns</p>
        </div>
        <Link
          href="/admin/campaigns/new"
          style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", background: "#C9952A", color: "#0D0D0D", fontSize: "13px", fontWeight: 500, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <Plus size={15} /> New Campaign
        </Link>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #2A2A2A" }}>
        {!campaigns?.length ? (
          <div className="py-20 text-center" style={{ background: "#161616" }}>
            <p style={{ fontSize: "13px", color: "#706B63" }}>
              No campaigns yet.{" "}
              <Link href="/admin/campaigns/new" style={{ color: "#C9952A" }}>Create your first campaign →</Link>
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#161616" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #2A2A2A" }}>
                {["Campaign", "Status", "Category", "Progress", "Raised / Target", "Created"].map((h) => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
                <th style={{ padding: "10px 16px", width: 60 }} />
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign: Campaign, i) => {
                const pct = Math.min(Math.round((campaign.raised_amount / campaign.target_amount) * 100), 100);
                return (
                  <tr
                    key={campaign.id}
                    className="admin-table-row"
                    style={{ borderBottom: i < campaigns.length - 1 ? "1px solid #1F1F1F" : "none", transition: "background 0.15s" }}
                  >
                    <td style={{ padding: "14px 16px", maxWidth: 260 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {campaign.cover_image && (
                          <img src={campaign.cover_image} alt="" style={{ width: 34, height: 34, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 500, color: "#F0EDE8", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {campaign.title}
                          </p>
                          <p style={{ fontSize: "11px", color: "#706B63", fontFamily: "monospace" }}>/{campaign.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <CampaignStatusBadge status={campaign.status as CampaignStatus} />
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ fontSize: "12px", color: "#B8B3AC" }}>{campaign.category ?? "—"}</span>
                    </td>

                    <td style={{ padding: "14px 16px", minWidth: 120 }}>
                      <p style={{ fontSize: "11px", color: "#B8B3AC", fontFamily: "monospace", marginBottom: 4 }}>{pct}%</p>
                      <div style={{ height: 3, background: "#2A2A2A", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #7A5A1A, #C9952A)", borderRadius: 99 }} />
                      </div>
                    </td>

                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: "13px", color: "#F0EDE8", fontFamily: "monospace" }}>{formatCurrency(campaign.raised_amount)}</p>
                      <p style={{ fontSize: "11px", color: "#706B63" }}>of {formatCurrency(campaign.target_amount)}</p>
                    </td>

                    <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "12px", color: "#706B63" }}>
                        {formatDate(campaign.created_at, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>

                    <td style={{ padding: "14px 16px" }}>
                      <Link href={`/admin/campaigns/${campaign.id}`} style={{ fontSize: "12px", color: "#706B63", textDecoration: "none", padding: "4px 10px", borderRadius: "6px", border: "1px solid #2A2A2A" }}>
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}