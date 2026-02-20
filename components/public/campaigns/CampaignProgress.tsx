import type { Campaign } from "@/lib/types/app";
import { formatCurrency, calcProgress } from "@/lib/utils";

export default function CampaignProgress({ campaign }: { campaign: Campaign }) {
  const progress = calcProgress(campaign.raised_amount ?? 0, campaign.target_amount ?? 0);
  const isUrgent = campaign.status === "urgent";

  return (
    <div
      style={{
        padding: "24px",
        background: "#161616",
        border: "1px solid #1F1F1F",
        borderRadius: "12px",
      }}
    >
      {/* Amounts */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "28px", fontWeight: 500, color: "#C9952A", lineHeight: 1 }}>
            {formatCurrency(campaign.raised_amount ?? 0)}
          </p>
          <p style={{ fontSize: "12px", color: "#4A4540", marginTop: "4px" }}>
            raised of {formatCurrency(campaign.target_amount ?? 0)} goal
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "24px", fontWeight: 500, color: "#F0EDE8", lineHeight: 1 }}>
            {progress}%
          </p>
        </div>
      </div>

      {/* Bar */}
      <div style={{ height: "6px", background: "#1F1F1F", borderRadius: 99, overflow: "hidden", marginBottom: "16px" }}>
        <div style={{
          height: "100%",
          width: `${Math.min(progress, 100)}%`,
          background: isUrgent
            ? "linear-gradient(90deg, #A0412A, #E07A5A)"
            : "linear-gradient(90deg, #7A5A1A, #C9952A)",
          borderRadius: 99,
          transition: "width 0.8s ease",
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: "24px" }}>
        {campaign.donor_count != null && (
          <div>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "16px", fontWeight: 500, color: "#F0EDE8" }}>
              {campaign.donor_count.toLocaleString()}
            </p>
            <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "2px" }}>donors</p>
          </div>
        )}
      </div>
    </div>
  );
}