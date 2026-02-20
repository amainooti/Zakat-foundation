import type { SiteSettings } from "@/lib/types/app";

export default function StatsBar({ settings }: { settings: SiteSettings }) {
  const stats = [
    { value: settings.home_stats_1_value || "$42M+",    label: settings.home_stats_1_label || "Raised to date" },
    { value: settings.home_stats_2_value || "1.2M",     label: settings.home_stats_2_label || "Beneficiaries" },
    { value: settings.home_stats_3_value || "40+",      label: settings.home_stats_3_label || "Countries reached" },
    { value: settings.home_stats_4_value || "23 years", label: settings.home_stats_4_label || "Of trusted giving" },
  ];

  return (
    <div style={{ background: "#161616", borderTop: "1px solid #1F1F1F", borderBottom: "1px solid #1F1F1F" }}>
      <div
        style={{
          maxWidth: "1200px", margin: "0 auto",
          padding: "0 clamp(24px, 6vw, 80px)",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              padding: "32px 24px",
              borderRight: i < 3 ? "1px solid #1F1F1F" : "none",
              textAlign: "center",
            }}
          >
            <p style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "clamp(24px, 3vw, 36px)",
              fontWeight: 500, color: "#C9952A",
              marginBottom: "6px", lineHeight: 1,
            }}>
              {stat.value}
            </p>
            <p style={{
              fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#4A4540",
            }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}