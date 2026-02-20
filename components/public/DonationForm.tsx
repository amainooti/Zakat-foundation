"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Heart, RefreshCw, CheckCircle2 } from "lucide-react";
import type { Campaign } from "@/lib/types/app";

const PRESET_AMOUNTS = [10, 25, 50, 100, 250, 500];

interface Props {
  campaigns?: Pick<Campaign, "id" | "title" | "slug" | "status">[];
  defaultCampaignId?: string;
  presetAmounts?: number[];
}

export default function DonationForm({
  campaigns = [],
  defaultCampaignId,
  presetAmounts = PRESET_AMOUNTS,
}: Props) {
  const [amount,          setAmount]          = useState<number | "">(50);
  const [customAmount,    setCustomAmount]     = useState("");
  const [isCustom,        setIsCustom]        = useState(false);
  const [email,           setEmail]           = useState("");
  const [name,            setName]            = useState("");
  const [campaignId,      setCampaignId]      = useState(defaultCampaignId ?? "");
  const [isRecurring,     setIsRecurring]     = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState("");

  const finalAmount = isCustom ? parseFloat(customAmount) : (amount as number);
  const isValid = finalAmount >= 1 && email.includes("@");
  const selectedCampaign = campaigns.find((c) => c.id === campaignId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/paystack/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          amount:            finalAmount,
          currency:          "USD",
          campaign_id:       campaignId || null,
          campaign_slug:     selectedCampaign?.slug ?? null,
          donor_name:        name || null,
          is_recurring:      isRecurring,
          newsletter_opt_in: newsletterOptIn,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }
      window.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const field: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    padding: "10px 12px", borderRadius: "8px",
    background: "#1F1F1F", border: "1px solid #2A2A2A",
    color: "#F0EDE8", fontSize: "14px", fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s",
  };

  return (
    <>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Amount selector */}
        <div>
          <p style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "10px" }}>
            Select Amount
          </p>

          {/* Preset grid — 3 cols on normal, 2 cols on very small */}
          <div className="preset-grid">
            {presetAmounts.map((preset) => {
              const active = !isCustom && amount === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => { setAmount(preset); setIsCustom(false); setCustomAmount(""); }}
                  style={{
                    padding: "10px 8px", borderRadius: "8px", border: "1px solid",
                    borderColor: active ? "#C9952A" : "#2A2A2A",
                    background: active ? "rgba(201,149,42,0.1)" : "#1F1F1F",
                    color: active ? "#C9952A" : "#B8B3AC",
                    fontSize: "14px", fontWeight: active ? 600 : 400,
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.15s",
                  }}
                >
                  ${preset}
                </button>
              );
            })}
          </div>

          {/* Custom amount */}
          <div style={{ position: "relative", marginTop: "10px" }}>
            <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#706B63", fontSize: "14px" }}>$</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => { setCustomAmount(e.target.value); setIsCustom(true); setAmount(""); }}
              onFocus={() => setIsCustom(true)}
              style={{ ...field, paddingLeft: "24px", borderColor: isCustom ? "#C9952A" : "#2A2A2A" }}
            />
          </div>

          {finalAmount >= 1 && (
            <p style={{ fontSize: "12px", color: "#706B63", marginTop: "8px", textAlign: "right" }}>
              {isRecurring ? "Monthly giving: " : "One-time: "}
              <span style={{ color: "#C9952A", fontWeight: 600 }}>{formatCurrency(finalAmount)}</span>
            </p>
          )}
        </div>

        {/* Recurring toggle */}
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 14px", borderRadius: "8px",
            background: isRecurring ? "rgba(201,149,42,0.06)" : "#1A1A1A",
            border: `1px solid ${isRecurring ? "rgba(201,149,42,0.25)" : "#2A2A2A"}`,
            cursor: "pointer", transition: "all 0.2s", gap: "12px",
          }}
          onClick={() => setIsRecurring((v) => !v)}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
            <RefreshCw size={15} style={{ color: isRecurring ? "#C9952A" : "#706B63", flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: "13px", fontWeight: 500, color: isRecurring ? "#F0EDE8" : "#B8B3AC" }}>
                Make this a monthly donation
              </p>
              <p style={{ fontSize: "11px", color: "#706B63" }}>Cancel anytime · Automatic billing</p>
            </div>
          </div>
          {/* Toggle pill */}
          <div style={{ width: 36, height: 20, borderRadius: 99, flexShrink: 0, background: isRecurring ? "#C9952A" : "#2A2A2A", position: "relative", transition: "background 0.2s" }}>
            <div style={{ position: "absolute", top: 2, left: isRecurring ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: "#F0EDE8", transition: "left 0.2s" }} />
          </div>
        </div>

        {/* Campaign selector */}
        {campaigns.length > 0 && (
          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "8px" }}>
              Direct to Campaign <span style={{ color: "#4A4A44", textTransform: "none", letterSpacing: 0 }}>(optional)</span>
            </label>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              style={{ ...field, cursor: "pointer" }}
            >
              <option value="">General fund</option>
              {campaigns
                .filter((c) => c.status === "active" || c.status === "urgent")
                .map((c) => <option key={c.id} value={c.id}>{c.title}</option>)
              }
            </select>
          </div>
        )}

        {/* Donor info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "#706B63", marginBottom: "2px" }}>
            Your Details
          </label>
          <input
            type="text"
            placeholder="Full name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={field}
          />
          <input
            type="email"
            placeholder="Email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ ...field, borderColor: email && !email.includes("@") ? "rgba(160,65,42,0.6)" : "#2A2A2A" }}
          />
          <p style={{ fontSize: "11px", color: "#706B63" }}>Your receipt will be sent here</p>
        </div>

        {/* Newsletter opt-in */}
        <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", cursor: "pointer" }}>
          <div
            onClick={() => setNewsletterOptIn((v) => !v)}
            style={{
              width: 16, height: 16, borderRadius: "4px", flexShrink: 0, marginTop: 1,
              background: newsletterOptIn ? "#C9952A" : "#1F1F1F",
              border: `1px solid ${newsletterOptIn ? "#C9952A" : "#2A2A2A"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
          >
            {newsletterOptIn && <CheckCircle2 size={11} style={{ color: "#0D0D0D" }} />}
          </div>
          <p style={{ fontSize: "12px", color: "#706B63", lineHeight: 1.5 }}>
            Keep me updated with news and impact stories from Zakat Foundation
          </p>
        </label>

        {/* Error */}
        {error && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(160,65,42,0.1)", border: "1px solid rgba(160,65,42,0.2)" }}>
            <p style={{ fontSize: "12px", color: "#E07A5A" }}>{error}</p>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || loading}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            padding: "14px", borderRadius: "10px", border: "none",
            background: !isValid || loading ? "rgba(201,149,42,0.4)" : "#C9952A",
            color: "#0D0D0D", fontSize: "15px", fontWeight: 600,
            cursor: !isValid || loading ? "not-allowed" : "pointer",
            fontFamily: "inherit", transition: "all 0.15s",
            letterSpacing: "0.01em", width: "100%",
          }}
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Preparing checkout…</>
          ) : (
            <><Heart size={16} />{isRecurring ? `Give ${formatCurrency(finalAmount || 0)} / month` : `Donate ${formatCurrency(finalAmount || 0)}`}</>
          )}
        </button>

        <p style={{ fontSize: "11px", color: "#4A4A44", textAlign: "center", lineHeight: 1.5 }}>
          Secure payment via Paystack · Tax-deductible receipt via email
        </p>
      </form>

      <style>{`
        .preset-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        @media (max-width: 360px) {
          .preset-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </>
  );
}