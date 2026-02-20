"use client";

import { useState, useTransition } from "react";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  subscribed: boolean;
  created_at: string;
}

interface Props {
  subscribers: Subscriber[];
  totalCount: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function SourceBadge({ source }: { source: string | null }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    donate:   { label: "Donor",    color: "#5DBF84", bg: "rgba(42,122,74,0.12)"   },
    homepage: { label: "Homepage", color: "#B8B3AC", bg: "rgba(184,179,172,0.08)" },
    manual:   { label: "Manual",   color: "#C9952A", bg: "rgba(201,149,42,0.10)"  },
  };
  const s = map[source ?? ""] ?? { label: source ?? "—", color: "#706B63", bg: "rgba(112,107,99,0.1)" };
  return (
    <span style={{ fontSize: "10px", fontWeight: 600, padding: "2px 8px", borderRadius: 99, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

export default function NewsletterClient({ subscribers, totalCount }: Props) {
  const [tab, setTab]         = useState<"subscribers" | "broadcast">("subscribers");
  const [search, setSearch]   = useState("");
  const [filter, setFilter]   = useState<"all" | "active" | "unsubscribed">("active");

  // Broadcast state
  const [subject, setSubject]   = useState("");
  const [body, setBody]         = useState("");
  const [preview, setPreview]   = useState(false);
  const [sending, startSend]    = useTransition();
  const [sendResult, setSendResult] = useState<{ ok: boolean; message: string } | null>(null);

  const filtered = subscribers.filter((s) => {
    const matchSearch = !search || s.email.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all"          ? true :
      filter === "active"       ? s.subscribed :
      /* unsubscribed */          !s.subscribed;
    return matchSearch && matchFilter;
  });

  const activeCount = subscribers.filter((s) => s.subscribed).length;

  const handleBroadcast = () => {
    if (!subject.trim() || !body.trim()) return;
    startSend(async () => {
      try {
        const res = await fetch("/api/newsletter/broadcast", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, body }),
        });
        const data = await res.json();
        if (res.ok) {
          setSendResult({ ok: true, message: `Sent to ${data.sent ?? activeCount} subscribers.` });
          setSubject("");
          setBody("");
        } else {
          setSendResult({ ok: false, message: data.error ?? "Failed to send." });
        }
      } catch {
        setSendResult({ ok: false, message: "Network error." });
      }
    });
  };

  const tabBtn = (id: "subscribers" | "broadcast", label: string) => (
    <button
      onClick={() => { setTab(id); setSendResult(null); }}
      style={{
        padding: "8px 20px", border: "none", borderRadius: "6px",
        background: tab === id ? "#1F1F1F" : "transparent",
        color: tab === id ? "#F0EDE8" : "#706B63",
        fontSize: "13px", fontWeight: tab === id ? 600 : 400,
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "9px 12px", borderRadius: "8px",
    background: "#0D0D0D", border: "1px solid #2A2A2A",
    color: "#F0EDE8", fontSize: "13px", outline: "none",
    fontFamily: "inherit",
  };

  return (
    <div style={{ padding: "24px 32px" }}>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px", maxWidth: "600px" }}>
        {[
          { label: "Total",        value: totalCount },
          { label: "Active",       value: activeCount },
          { label: "Unsubscribed", value: totalCount - activeCount },
        ].map(({ label, value }) => (
          <div key={label} style={{ padding: "16px 20px", background: "#161616", border: "1px solid #1F1F1F", borderRadius: "10px" }}>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "22px", fontWeight: 500, color: "#C9952A", marginBottom: "4px" }}>
              {value.toLocaleString()}
            </p>
            <p style={{ fontSize: "11px", color: "#4A4540", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", padding: "4px", background: "#161616", border: "1px solid #1F1F1F", borderRadius: "8px", marginBottom: "24px", width: "fit-content" }}>
        {tabBtn("subscribers", "Subscribers")}
        {tabBtn("broadcast", "Broadcast")}
      </div>

      {/* ── Subscribers tab ── */}
      {tab === "subscribers" && (
        <div>
          {/* Toolbar */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              type="search"
              placeholder="Search by email or name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...inputStyle, maxWidth: "300px" }}
            />
            <div style={{ display: "flex", gap: "6px" }}>
              {(["all", "active", "unsubscribed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 14px", borderRadius: "6px",
                    border: `1px solid ${filter === f ? "#C9952A" : "#2A2A2A"}`,
                    background: filter === f ? "rgba(201,149,42,0.08)" : "transparent",
                    color: filter === f ? "#C9952A" : "#706B63",
                    fontSize: "12px", fontWeight: 600, cursor: "pointer",
                    textTransform: "capitalize", letterSpacing: "0.04em",
                    transition: "all 0.15s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <p style={{ fontSize: "12px", color: "#4A4540", marginLeft: "auto", alignSelf: "center" }}>
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Table */}
          <div style={{ background: "#161616", border: "1px solid #1F1F1F", borderRadius: "12px", overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 120px 120px", gap: "0", padding: "10px 20px", borderBottom: "1px solid #1F1F1F" }}>
              {["Email / Name", "Source", "Joined", "Status"].map((h) => (
                <p key={h} style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4A4540" }}>{h}</p>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#4A4540" }}>No subscribers found.</p>
              </div>
            ) : (
              <div style={{ maxHeight: "520px", overflowY: "auto" }}>
                {filtered.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      display: "grid", gridTemplateColumns: "1fr 160px 120px 120px",
                      padding: "12px 20px", alignItems: "center",
                      borderBottom: i < filtered.length - 1 ? "1px solid #1A1A1A" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#1A1A1A")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div>
                      <p style={{ fontSize: "13px", color: "#F0EDE8", marginBottom: s.name ? "2px" : "0" }}>{s.email}</p>
                      {s.name && <p style={{ fontSize: "11px", color: "#706B63" }}>{s.name}</p>}
                    </div>
                    <SourceBadge source={s.source} />
                    <p style={{ fontSize: "12px", color: "#706B63" }}>{formatDate(s.created_at)}</p>
                    <span style={{
                      fontSize: "10px", fontWeight: 600, padding: "2px 8px",
                      borderRadius: 99, width: "fit-content",
                      background: s.subscribed ? "rgba(42,122,74,0.12)" : "rgba(112,107,99,0.1)",
                      color: s.subscribed ? "#5DBF84" : "#706B63",
                    }}>
                      {s.subscribed ? "Active" : "Unsub'd"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Broadcast tab ── */}
      {tab === "broadcast" && (
        <div style={{ maxWidth: "680px" }}>
          <div style={{ padding: "14px 18px", background: "rgba(201,149,42,0.06)", border: "1px solid rgba(201,149,42,0.15)", borderRadius: "8px", marginBottom: "24px" }}>
            <p style={{ fontSize: "13px", color: "#B8B3AC" }}>
              This will send to <strong style={{ color: "#C9952A" }}>{activeCount.toLocaleString()} active subscriber{activeCount !== 1 ? "s" : ""}</strong>. Double-check your content before sending.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Subject */}
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#706B63", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Ramadan Appeal — Your support is needed"
                style={inputStyle}
              />
            </div>

            {/* Body */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 600, color: "#706B63", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Email Body
                </label>
                <button
                  onClick={() => setPreview((v) => !v)}
                  style={{ fontSize: "11px", color: "#C9952A", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                >
                  {preview ? "← Edit" : "Preview →"}
                </button>
              </div>

              {preview ? (
                <div style={{ padding: "20px", background: "#0D0D0D", border: "1px solid #2A2A2A", borderRadius: "8px", minHeight: "220px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "4px" }}>{subject || "No subject"}</p>
                  <div style={{ height: "1px", background: "#1F1F1F", margin: "12px 0" }} />
                  <pre style={{ fontSize: "13px", color: "#B8B3AC", lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>
                    {body || "No content"}
                  </pre>
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message here. Plain text only — keep it personal and concise."
                  rows={10}
                  style={{ ...inputStyle, resize: "vertical", lineHeight: 1.65 }}
                />
              )}
              <p style={{ fontSize: "11px", color: "#4A4540", marginTop: "6px" }}>
                Plain text only. An unsubscribe link will be appended automatically.
              </p>
            </div>

            {/* Result */}
            {sendResult && (
              <div style={{
                padding: "12px 16px", borderRadius: "8px",
                background: sendResult.ok ? "rgba(42,122,74,0.1)" : "rgba(160,65,42,0.1)",
                border: `1px solid ${sendResult.ok ? "rgba(42,122,74,0.25)" : "rgba(160,65,42,0.25)"}`,
                color: sendResult.ok ? "#5DBF84" : "#E07A5A",
                fontSize: "13px",
              }}>
                {sendResult.message}
              </div>
            )}

            {/* Send */}
            <button
              onClick={handleBroadcast}
              disabled={sending || !subject.trim() || !body.trim()}
              style={{
                padding: "12px 28px", borderRadius: "8px", border: "none",
                background: sending || !subject.trim() || !body.trim() ? "#4A3A14" : "#C9952A",
                color: sending || !subject.trim() || !body.trim() ? "#706B63" : "#0D0D0D",
                fontSize: "13px", fontWeight: 700, cursor: sending ? "not-allowed" : "pointer",
                letterSpacing: "0.04em", transition: "all 0.15s",
                alignSelf: "flex-start",
              }}
            >
              {sending ? "Sending…" : `Send to ${activeCount.toLocaleString()} subscribers`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}