import type { CampaignStatus } from "@/lib/types/app";

const CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string }> = {
  active:    { label: "Active",    bg: "rgba(42,122,74,0.12)",  color: "#4AAF7A" },
  urgent:    { label: "Urgent",    bg: "rgba(160,65,42,0.12)",  color: "#E07A5A" },
  completed: { label: "Completed", bg: "rgba(201,149,42,0.12)", color: "#C9952A" },
  archived:  { label: "Archived",  bg: "rgba(112,107,99,0.12)", color: "#706B63" },
};

export default function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const { label, bg, color } = CONFIG[status] ?? CONFIG.active;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 8px", borderRadius: 99,
        background: bg, color, fontSize: "11px", fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}