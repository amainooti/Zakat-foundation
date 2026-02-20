import { createClient } from "@/lib/supabase/server";
import { getSiteSettings } from "@/lib/settings";
import DonationForm from "@/components/public/DonationForm";
import type { Campaign } from "@/lib/types/app";

export const metadata = {
  title: "Donate — Zakat Foundation of America",
  description: "Your generosity changes lives. Donate to Zakat Foundation of America.",
};

export default async function DonatePage() {
  const supabase = await createClient();
  const settings = await getSiteSettings();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, title, slug, status")
    .in("status", ["active", "urgent"])
    .order("is_featured", { ascending: false });

  const presetAmounts: number[] = settings.donate_preset_amounts
    ? JSON.parse(settings.donate_preset_amounts)
    : [10, 25, 50, 100, 250, 500];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D0D" }}>

      {/* Hero */}
      <div
        style={{
          background: "linear-gradient(to bottom, #161616, #0D0D0D)",
          borderBottom: "1px solid #1F1F1F",
          padding: "80px 24px 60px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "#C9952A", marginBottom: "14px" }}>
          Make a Difference
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "clamp(36px, 5vw, 54px)",
            fontWeight: 600, color: "#F0EDE8",
            lineHeight: 1.15, marginBottom: "16px",
          }}
        >
          {settings.donate_heading || "Your Generosity Saves Lives"}
        </h1>
        {settings.donate_intro && (
          <p style={{ fontSize: "16px", color: "#706B63", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            {settings.donate_intro}
          </p>
        )}
      </div>

      {/* Form + context */}
      <div
        style={{
          maxWidth: "1100px", margin: "0 auto",
          padding: "60px 24px",
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "60px",
          alignItems: "start",
        }}
      >
        {/* Left — why give */}
        <div>
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "32px", fontWeight: 600,
              color: "#F0EDE8", marginBottom: "20px", lineHeight: 1.2,
            }}
          >
            Where Your Donation Goes
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { pct: "82%", label: "Direct programme delivery", desc: "Food, medical care, shelter, education — reaching families in need." },
              { pct: "10%", label: "Fundraising & operations", desc: "Ensuring your donation reaches its destination efficiently." },
              { pct: "8%",  label: "Administration",           desc: "Governance, compliance, and accountability." },
            ].map(({ pct, label, desc }) => (
              <div
                key={label}
                style={{
                  display: "flex", gap: "16px",
                  padding: "16px 18px", borderRadius: "10px",
                  background: "#161616", border: "1px solid #1F1F1F",
                }}
              >
                <p style={{ fontSize: "22px", fontWeight: 700, color: "#C9952A", fontFamily: "monospace", flexShrink: 0, minWidth: "52px" }}>
                  {pct}
                </p>
                <div>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "4px" }}>{label}</p>
                  <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.5 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Active campaigns */}
          {(campaigns?.length ?? 0) > 0 && (
            <div style={{ marginTop: "40px" }}>
              <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "14px" }}>
                Active Campaigns
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {campaigns!.map((c) => (
                  <a
                    key={c.id}
                    href={`/campaigns/${c.slug}`}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "12px 14px", borderRadius: "8px",
                      background: "#161616", border: "1px solid #1F1F1F",
                      textDecoration: "none", transition: "border-color 0.15s",
                    }}
                  >
                    <p style={{ fontSize: "13px", color: "#B8B3AC" }}>{c.title}</p>
                    {c.status === "urgent" && (
                      <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 7px", borderRadius: 99, background: "rgba(160,65,42,0.12)", color: "#E07A5A" }}>
                        Urgent
                      </span>
                    )}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — form */}
        <div
          style={{
            position: "sticky", top: "24px",
            background: "#161616", border: "1px solid #2A2A2A",
            borderRadius: "16px", padding: "28px",
          }}
        >
          <DonationForm
            campaigns={(campaigns ?? []) as Campaign[]}
            presetAmounts={presetAmounts}
          />
        </div>
      </div>
    </div>
  );
}