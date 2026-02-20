"use client";

import { useState, useTransition } from "react";
import { saveSiteSettings, type SaveResult } from "@/lib/site";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "url" | "email" | "tel" | "json-array";
  placeholder?: string;
  hint?: string;
  rows?: number;
}

interface TabDef {
  id: string;
  label: string;
  icon: string;
  sections: { heading: string; fields: FieldDef[] }[];
}

// ─── Schema — every site_settings key organised by tab ──────────────────────

const TABS: TabDef[] = [
  {
    id: "general",
    label: "General",
    icon: "⚙",
    sections: [
      {
        heading: "Site Identity",
        fields: [
          { key: "site_name",        label: "Site Name",          type: "text",  placeholder: "Zakat Foundation of America" },
          { key: "site_tagline",     label: "Tagline",            type: "text",  placeholder: "Giving Where It's Needed Most" },
          { key: "site_description", label: "Meta Description",   type: "textarea", rows: 2, placeholder: "Used in search engine results and link previews." },
          { key: "site_logo_url",    label: "Logo URL",           type: "url",   hint: "Paste a URL from the Media Library" },
          { key: "site_og_image",    label: "Default OG Image",   type: "url",   hint: "Shown when sharing links on social media" },
        ],
      },
      {
        heading: "Contact",
        fields: [
          { key: "contact_email",    label: "Contact Email",   type: "email",  placeholder: "info@zakatfoundation.org" },
          { key: "contact_phone",    label: "Phone",           type: "tel",    placeholder: "+1 (800) 000-0000" },
          { key: "contact_address",  label: "Address",         type: "textarea", rows: 2 },
        ],
      },
      {
        heading: "Social Links",
        fields: [
          { key: "social_facebook",  label: "Facebook",   type: "url" },
          { key: "social_twitter",   label: "X / Twitter", type: "url" },
          { key: "social_instagram", label: "Instagram",  type: "url" },
          { key: "social_youtube",   label: "YouTube",    type: "url" },
          { key: "social_linkedin",  label: "LinkedIn",   type: "url" },
        ],
      },
    ],
  },
  {
    id: "nav",
    label: "Navigation",
    icon: "≡",
    sections: [
      {
        heading: "Top Navigation",
        fields: [
          { key: "nav_announcement",    label: "Announcement Banner",   type: "text", placeholder: "Ramadan Appeal — Double your impact this month", hint: "Leave blank to hide the banner" },
          { key: "nav_announcement_url",label: "Banner Link",           type: "url" },
          { key: "nav_cta_text",        label: "CTA Button Text",       type: "text", placeholder: "Donate Now" },
          { key: "nav_cta_url",         label: "CTA Button URL",        type: "url",  placeholder: "/donate" },
        ],
      },
    ],
  },
  {
    id: "home",
    label: "Homepage",
    icon: "⌂",
    sections: [
      {
        heading: "Hero Section",
        fields: [
          { key: "home_hero_eyebrow",    label: "Eyebrow Label",   type: "text",     placeholder: "Trusted since 2001" },
          { key: "home_hero_heading",    label: "Heading",         type: "textarea", rows: 2, placeholder: "Transforming Lives\nThrough Zakat" },
          { key: "home_hero_subheading", label: "Subheading",      type: "textarea", rows: 2 },
          { key: "home_hero_cta_text",   label: "Primary CTA",     type: "text",     placeholder: "Donate Now" },
          { key: "home_hero_cta_url",    label: "Primary CTA URL", type: "url",      placeholder: "/donate" },
          { key: "home_hero_image",      label: "Hero Image URL",  type: "url",      hint: "Recommended: 1440×900px" },
        ],
      },
      {
        heading: "Stats Bar",
        fields: [
          { key: "home_stat_1_value", label: "Stat 1 — Value",  type: "text", placeholder: "$42M+" },
          { key: "home_stat_1_label", label: "Stat 1 — Label",  type: "text", placeholder: "Raised to date" },
          { key: "home_stat_2_value", label: "Stat 2 — Value",  type: "text", placeholder: "1.2M" },
          { key: "home_stat_2_label", label: "Stat 2 — Label",  type: "text", placeholder: "Beneficiaries" },
          { key: "home_stat_3_value", label: "Stat 3 — Value",  type: "text", placeholder: "40+" },
          { key: "home_stat_3_label", label: "Stat 3 — Label",  type: "text", placeholder: "Countries reached" },
          { key: "home_stat_4_value", label: "Stat 4 — Value",  type: "text", placeholder: "23 years" },
          { key: "home_stat_4_label", label: "Stat 4 — Label",  type: "text", placeholder: "Of trusted giving" },
        ],
      },
      {
        heading: "Mission Section",
        fields: [
          { key: "home_mission_heading", label: "Heading",    type: "text" },
          { key: "home_mission_body",    label: "Body copy",  type: "textarea", rows: 4 },
          { key: "home_mission_image",   label: "Image URL",  type: "url" },
        ],
      },
      {
        heading: "Newsletter CTA",
        fields: [
          { key: "home_newsletter_heading",     label: "Heading",           type: "text" },
          { key: "home_newsletter_subheading",  label: "Subheading",        type: "text" },
          { key: "home_newsletter_button_text", label: "Button Text",       type: "text", placeholder: "Subscribe" },
        ],
      },
    ],
  },
  {
    id: "donate",
    label: "Donate",
    icon: "♥",
    sections: [
      {
        heading: "Donate Page",
        fields: [
          { key: "donate_heading",        label: "Hero Heading",   type: "text",       placeholder: "Your Generosity Saves Lives" },
          { key: "donate_intro",          label: "Intro Copy",     type: "textarea",   rows: 3 },
          {
            key: "donate_preset_amounts",
            label: "Preset Amounts",
            type: "json-array",
            placeholder: "[10, 25, 50, 100, 250, 500]",
            hint: "JSON array of numbers e.g. [10, 25, 50, 100, 250, 500]",
          },
          { key: "donate_default_amount",  label: "Default Amount", type: "text",       placeholder: "50", hint: "Pre-selected amount on page load" },
          { key: "donate_success_heading", label: "Thank-you Heading", type: "text",   placeholder: "JazakAllah Khair" },
          { key: "donate_success_body",    label: "Thank-you Body",    type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: "◎",
    sections: [
      {
        heading: "Hero",
        fields: [
          { key: "about_hero_heading",    label: "Heading",    type: "text" },
          { key: "about_hero_subheading", label: "Subheading", type: "textarea", rows: 2 },
          { key: "about_hero_image",      label: "Image URL",  type: "url" },
        ],
      },
      {
        heading: "Mission & Vision",
        fields: [
          { key: "about_mission_heading", label: "Mission Heading", type: "text" },
          { key: "about_mission_body",    label: "Mission Body",    type: "textarea", rows: 4 },
          { key: "about_vision_heading",  label: "Vision Heading",  type: "text" },
          { key: "about_vision_body",     label: "Vision Body",     type: "textarea", rows: 4 },
        ],
      },
      {
        heading: "History",
        fields: [
          { key: "about_history_heading", label: "Section Heading", type: "text" },
          { key: "about_history_body",    label: "Body copy",       type: "textarea", rows: 6 },
        ],
      },
      {
        heading: "Team Section",
        fields: [
          { key: "about_team_heading",    label: "Section Heading", type: "text" },
          { key: "about_team_subheading", label: "Subheading",      type: "text" },
        ],
      },
    ],
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: "◈",
    sections: [
      {
        heading: "Campaigns Listing Page",
        fields: [
          { key: "campaigns_heading",    label: "Page Heading",    type: "text", placeholder: "Our Campaigns" },
          { key: "campaigns_subheading", label: "Subheading",      type: "textarea", rows: 2 },
          { key: "campaigns_empty_text", label: "Empty State Text",type: "text", placeholder: "No active campaigns at this time." },
        ],
      },
    ],
  },
  {
    id: "blog",
    label: "Blog",
    icon: "✎",
    sections: [
      {
        heading: "Blog Listing Page",
        fields: [
          { key: "blog_heading",    label: "Page Heading", type: "text",     placeholder: "News & Stories" },
          { key: "blog_subheading", label: "Subheading",   type: "textarea", rows: 2 },
          { key: "blog_empty_text", label: "Empty State",  type: "text",     placeholder: "No posts yet." },
        ],
      },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    icon: "▬",
    sections: [
      {
        heading: "Footer Content",
        fields: [
          { key: "footer_tagline",    label: "Tagline",        type: "text",     placeholder: "Giving Where It's Needed Most" },
          { key: "footer_about",      label: "About Blurb",    type: "textarea", rows: 3 },
          { key: "footer_copyright",  label: "Copyright Line", type: "text",     placeholder: "© 2025 Zakat Foundation of America. All rights reserved." },
          { key: "footer_ein",        label: "EIN / Charity No.", type: "text",  placeholder: "EIN: 36-4476244" },
          { key: "footer_disclaimer", label: "Legal Disclaimer", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Toast({ result, onClose }: { result: SaveResult; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed", bottom: "24px", right: "24px", zIndex: 100,
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 20px", borderRadius: "10px",
        background: result.success ? "#0F2A1A" : "#2A0F0F",
        border: `1px solid ${result.success ? "#2A7A4A" : "#A0412A"}`,
        color: result.success ? "#5DBF84" : "#E07A5A",
        fontSize: "13px", fontWeight: 500,
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        animation: "fadeUp 0.2s ease",
      }}
    >
      <span>{result.success ? "✓" : "✕"}</span>
      <span>{result.success ? "Settings saved" : `Error: ${result.error}`}</span>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", marginLeft: "8px", opacity: 0.7 }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Field Renderer ───────────────────────────────────────────────────────────

function Field({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (key: string, val: string) => void;
}) {
  const [jsonError, setJsonError] = useState<string | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0D0D0D",
    border: `1px solid ${jsonError ? "#A0412A" : "#2A2A2A"}`,
    borderRadius: "8px",
    color: "#F0EDE8",
    fontSize: "13px",
    padding: "9px 12px",
    outline: "none",
    fontFamily: field.type === "json-array" ? "'DM Mono', monospace" : "inherit",
    resize: field.type === "textarea" || field.type === "json-array" ? "vertical" : "none",
    lineHeight: 1.6,
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  const handleChange = (val: string) => {
    if (field.type === "json-array") {
      try {
        const parsed = JSON.parse(val);
        if (!Array.isArray(parsed)) throw new Error("Must be an array");
        setJsonError(null);
      } catch (e: unknown) {
        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
      }
    }
    onChange(field.key, val);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "11px", fontWeight: 600, color: "#706B63", letterSpacing: "0.08em", textTransform: "uppercase" }}>
        {field.label}
      </label>

      {field.type === "textarea" || field.type === "json-array" ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          style={inputStyle}
        />
      ) : (
        <input
          type={field.type}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={field.placeholder}
          style={inputStyle}
          onFocus={(e) => (e.currentTarget.style.borderColor = "#7A5A1A")}
          onBlur={(e) => (e.currentTarget.style.borderColor = jsonError ? "#A0412A" : "#2A2A2A")}
        />
      )}

      {jsonError && (
        <p style={{ fontSize: "11px", color: "#E07A5A", marginTop: "2px" }}>⚠ {jsonError}</p>
      )}
      {field.hint && !jsonError && (
        <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "2px" }}>{field.hint}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SiteEditorClient({
  initialSettings,
}: {
  initialSettings: Record<string, string>;
}) {
  const [activeTab, setActiveTab] = useState(TABS[0].id);
  const [values, setValues] = useState<Record<string, string>>(initialSettings);
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<SaveResult | null>(null);
  const [dirtyTabs, setDirtyTabs] = useState<Set<string>>(new Set());

  const currentTab = TABS.find((t) => t.id === activeTab)!;

  // Collect all keys belonging to the current tab
  const currentTabKeys = currentTab.sections.flatMap((s) => s.fields.map((f) => f.key));

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    // Mark tab as dirty
    const tab = TABS.find((t) => t.sections.some((s) => s.fields.some((f) => f.key === key)));
    if (tab) setDirtyTabs((prev) => new Set(prev).add(tab.id));
  };

  const handleSave = () => {
    // Only save keys in the current tab
    const payload: Record<string, string> = {};
    currentTabKeys.forEach((k) => {
      if (values[k] !== undefined) payload[k] = values[k];
    });

    startTransition(async () => {
      const result = await saveSiteSettings(payload);
      setToast(result);
      if (result.success) {
        setDirtyTabs((prev) => {
          const next = new Set(prev);
          next.delete(activeTab);
          return next;
        });
      }
      setTimeout(() => setToast(null), 4000);
    });
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        textarea { transition: border-color 0.15s; }
        textarea:focus { border-color: #7A5A1A !important; outline: none; }
      `}</style>

      <div style={{ display: "flex", height: "calc(100vh - 64px)", overflow: "hidden" }}>

        {/* ── Tab sidebar ─────────────────────────────────────────── */}
        <nav
          style={{
            width: "200px",
            flexShrink: 0,
            borderRight: "1px solid #1F1F1F",
            background: "#0D0D0D",
            padding: "20px 0",
            overflowY: "auto",
          }}
        >
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", color: "#4A4540", textTransform: "uppercase", padding: "0 16px 12px" }}>
            Page Content
          </p>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const isDirty  = dirtyTabs.has(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "9px 16px",
                  background: isActive ? "rgba(201,149,42,0.08)" : "transparent",
                  border: "none",
                  borderLeft: `2px solid ${isActive ? "#C9952A" : "transparent"}`,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.12s",
                }}
              >
                <span style={{ fontSize: "13px", opacity: 0.6, width: "16px" }}>{tab.icon}</span>
                <span style={{ fontSize: "13px", fontWeight: isActive ? 600 : 400, color: isActive ? "#F0EDE8" : "#706B63", flex: 1 }}>
                  {tab.label}
                </span>
                {isDirty && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#C9952A", flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </nav>

        {/* ── Editor area ──────────────────────────────────────────── */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>

          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 32px",
              height: "64px",
              borderBottom: "1px solid #1F1F1F",
              background: "#0D0D0D",
              flexShrink: 0,
            }}
          >
            <div>
              <p style={{ fontSize: "16px", fontWeight: 600, color: "#F0EDE8" }}>{currentTab.label}</p>
              <p style={{ fontSize: "12px", color: "#4A4540" }}>
                {currentTab.sections.reduce((acc, s) => acc + s.fields.length, 0)} fields
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={pending}
              style={{
                padding: "9px 20px",
                background: pending ? "#4A3A14" : "#C9952A",
                color: pending ? "#706B63" : "#0D0D0D",
                border: "none",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: pending ? "not-allowed" : "pointer",
                transition: "background 0.15s",
                letterSpacing: "0.03em",
              }}
            >
              {pending ? "Saving…" : "Save Changes"}
            </button>
          </div>

          {/* Scrollable fields */}
          <div style={{ flex: 1, overflowY: "auto", padding: "32px" }}>
            <div style={{ maxWidth: "680px", display: "flex", flexDirection: "column", gap: "40px" }}>
              {currentTab.sections.map((section) => (
                <div key={section.heading}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
                    <p style={{ fontSize: "13px", fontWeight: 600, color: "#C9952A", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {section.heading}
                    </p>
                    <div style={{ flex: 1, height: "1px", background: "#1F1F1F" }} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {section.fields.map((field) => (
                      <Field
                        key={field.key}
                        field={field}
                        value={values[field.key] ?? ""}
                        onChange={handleChange}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom save padding */}
            <div style={{ height: "80px" }} />
          </div>
        </div>
      </div>

      {toast && <Toast result={toast} onClose={() => setToast(null)} />}
    </>
  );
}