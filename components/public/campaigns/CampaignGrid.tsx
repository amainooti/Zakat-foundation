"use client";

import { useState } from "react";
import type { Campaign } from "@/lib/types/app";
import { formatCurrency, calcProgress } from "@/lib/utils";

function CampaignCard({ campaign }: { campaign: Campaign }) {
  const progress = calcProgress(campaign.raised_amount ?? 0, campaign.target_amount ?? 0);
  const isUrgent = campaign.status === "urgent";

  return (
    <a
      href={`/campaigns/${campaign.slug}`}
      style={{
        display: "flex", flexDirection: "column",
        background: "#161616", border: "1px solid #1F1F1F",
        borderRadius: "12px", overflow: "hidden",
        textDecoration: "none",
        transition: "border-color 0.2s, transform 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#2A2A2A"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#1F1F1F"; e.currentTarget.style.transform = "none"; }}
    >
      <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", background: "#0D0D0D" }}>
        {campaign.cover_image ? (
          <img src={campaign.cover_image} alt={campaign.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1F1F1F, #0D0D0D)" }} />
        )}
        <div style={{ position: "absolute", top: "12px", left: "12px", display: "flex", gap: "6px" }}>
          {isUrgent && (
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: "rgba(160,65,42,0.85)", color: "#FFCDB8" }}>
              Urgent
            </span>
          )}
          {campaign.category && (
            <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 99, background: "rgba(0,0,0,0.6)", color: "#B8B3AC", backdropFilter: "blur(4px)" }}>
              {campaign.category}
            </span>
          )}
        </div>
      </div>

      <div style={{ padding: "20px 20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: "20px", fontWeight: 600, color: "#F0EDE8", lineHeight: 1.25 }}>
          {campaign.title}
        </h2>

        {campaign.description && (
          <p style={{ fontSize: "13px", color: "#706B63", lineHeight: 1.65, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {campaign.description.replace(/<[^>]+>/g, "")}
          </p>
        )}

        <div style={{ marginTop: "auto", paddingTop: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "#F0EDE8", fontFamily: "'DM Mono', monospace" }}>
              {formatCurrency(campaign.raised_amount ?? 0)}
            </span>
            <span style={{ fontSize: "12px", color: "#4A4540" }}>
              {progress}% of {formatCurrency(campaign.target_amount ?? 0)}
            </span>
          </div>
          <div style={{ height: "3px", background: "#1F1F1F", borderRadius: 99, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${Math.min(progress, 100)}%`,
              background: isUrgent ? "linear-gradient(90deg, #A0412A, #E07A5A)" : "linear-gradient(90deg, #7A5A1A, #C9952A)",
              borderRadius: 99,
            }} />
          </div>
          {campaign.donor_count != null && (
            <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "8px" }}>
              {campaign.donor_count.toLocaleString()} donors
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

export default function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  const categories = ["All", ...Array.from(new Set(campaigns.map((c) => c.category).filter(Boolean)))];
  const [active, setActive] = useState("All");

  const filtered = active === "All" ? campaigns : campaigns.filter((c) => c.category === active);

  return (
    <div>
      {/* Filter pills */}
      {categories.length > 1 && (
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "40px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat!)}
              style={{
                padding: "6px 16px", borderRadius: 99,
                border: `1px solid ${active === cat ? "#C9952A" : "#2A2A2A"}`,
                background: active === cat ? "rgba(201,149,42,0.1)" : "transparent",
                color: active === cat ? "#C9952A" : "#706B63",
                fontSize: "12px", fontWeight: 600,
                letterSpacing: "0.06em", textTransform: "uppercase",
                cursor: "pointer", transition: "all 0.15s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0" }}>
          <p style={{ fontSize: "15px", color: "#4A4540" }}>No campaigns found.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filtered.map((c) => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}
    </div>
  );
}