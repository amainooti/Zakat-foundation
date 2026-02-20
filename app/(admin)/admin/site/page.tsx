import { getSiteSettings } from "@/lib/settings";
import SiteEditorClient from "@/components/admin/SiteEditorClient";

export const metadata = {
  title: "Site Editor — Admin",
};

export default async function SiteEditorPage() {
  const settings = await getSiteSettings();

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

      {/* Page title bar */}
      <div
        style={{
          padding: "20px 32px",
          borderBottom: "1px solid #1F1F1F",
          display: "flex",
          alignItems: "baseline",
          gap: "12px",
        }}
      >
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: "24px",
            fontWeight: 600,
            color: "#F0EDE8",
          }}
        >
          Site Editor
        </h1>
        <p style={{ fontSize: "13px", color: "#4A4540" }}>
          All public page content is managed here
        </p>
      </div>

      {/* Tabbed editor */}
      <SiteEditorClient initialSettings={settings as unknown as Record<string, string>} />
    </div>
  );
}