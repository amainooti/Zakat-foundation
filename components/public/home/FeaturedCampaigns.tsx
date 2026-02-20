"use client";

import type { Campaign, SiteSettings } from "@/lib/types/app";
import { formatCurrency, calcProgress } from "@/lib/utils";

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = calcProgress(campaign.raised_amount ?? 0, campaign.target_amount ?? 0);
  const isUrgent = campaign.status === "urgent";

  return (
    <a
      href={`/campaigns/${campaign.slug}`}
      style={{ display: "flex", flexDirection: "column", background: "#161616", border: "1px solid #1F1F1F", borderRadius: "12px", overflow: "hidden", textDecoration: "none", transition: "border-color 0.2s, transform 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1F1F1F"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#0D0D0D" }}>
        {campaign.cover_image
          ? <img src={campaign.cover_image} alt={campaign.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #161616)" }} />
        }
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
          {isUrgent && <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: "rgba(160,65,42,0.85)", color: "#FFCDB8" }}>Urgent</span>}
          {campaign.category && <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: "rgba(0,0,0,0.6)", color: "#B8B3AC", backdropFilter: "blur(4px)" }}>{campaign.category}</span>}
        </div>
      </div>
      <div style={{ padding: "20px", flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.25 }}>{campaign.title}</h3>
        {campaign.description && <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{campaign.description.replace(/<[^>]+>/g, "")}</p>}
        <div style={{ marginTop: "auto", paddingTop: "4px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", fontFamily: "'DM Mono', monospace" }}>{formatCurrency(campaign.raised_amount ?? 0)}</span>
            <span style={{ fontSize: "12px", color: "#4A4540" }}>{progress}% of {formatCurrency(campaign.target_amount ?? 0)}</span>
          </div>
          <div style={{ height: "3px", background: "#1F1F1F", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(progress, 100)}%`, background: isUrgent ? "linear-gradient(90deg, #A0412A, #E07A5A)" : "linear-gradient(90deg, #7A5A1A, #C9952A)", borderRadius: 99 }} />
          </div>
          {campaign.donor_count != null && <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "8px" }}>{campaign.donor_count.toLocaleString()} donors</p>}
        </div>
      </div>
    </a>
  );
}

export default function FeaturedCampaigns({ campaigns, settings }: { campaigns: Campaign[]; settings: SiteSettings }) {
  if (!campaigns.length) return null;

  const heading    = settings.home_campaigns_heading    || "Where Your Money Goes";
  const subheading = settings.home_campaigns_subheading;

  return (
    <>
      <section className="fc-section">
        <div className="fc-header">
          <div>
            <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "10px" }}>Active Campaigns</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.1 }}>{heading}</h2>
            {subheading && <p style={{ fontSize: "15px", color: "#706B63", marginTop: "10px", maxWidth: "480px" }}>{subheading}</p>}
          </div>
          <a href="/campaigns" style={{ fontSize: "13px", fontWeight: 600, color: "#C9952A", textDecoration: "none", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>All campaigns →</a>
        </div>
        <div className="fc-grid">
          {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      </section>

      <style>{`
        .fc-section { padding: 80px clamp(24px, 6vw, 80px); max-width: 1200px; margin: 0 auto; }
        .fc-header   { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; gap: 20px; flex-wrap: wrap; }
        .fc-grid     { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        @media (max-width: 768px) {
          .fc-section { padding: 56px clamp(20px, 5vw, 48px); }
          .fc-grid    { grid-template-columns: 1fr; gap: 16px; }
        }
        @media (max-width: 480px) {
          .fc-section { padding: 48px 20px; }
        }
      `}</style>
    </>
  );
}