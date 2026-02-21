"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { contributionSchema, type ContributionFormData } from "@/lib/validations/campaign";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CampaignContribution } from "@/lib/types/app";
import { Loader2, Plus, HandCoins } from "lucide-react";

const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD", "NGN", "SAR", "AED", "KWD"];

interface Props {
  campaignId:    string;
  contributions: CampaignContribution[];
}

export default function ProgressLogger({ campaignId, contributions }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema) as any,
    defaultValues: { currency: "USD" },
  });

  async function onSubmit(data: ContributionFormData) {
    setSaving(true);
    setError("");
    setSuccess(false);

    const { error: err } = await supabase
      .from("campaign_contributions")
      .insert({
        campaign_id:  campaignId,
        amount:       data.amount,
        currency:     data.currency,
        source:       "manual",
        note:         data.note        || null,
        donor_name:   data.donor_name  || null,
        donor_email:  data.donor_email || null,
      });

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }

    reset({ currency: "USD" });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setSaving(false);
    router.refresh(); // re-fetches page data → progress bar updates
  }

  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "8px 10px", borderRadius: "7px",
    background: "#1F1F1F", border: "1px solid #2A2A2A",
    color: "#F0EDE8", fontSize: "12px", fontFamily: "inherit", outline: "none",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "10px", fontWeight: 500,
    color: "#B8B3AC", marginBottom: "5px", letterSpacing: "0.04em",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Log contribution form */}
      <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <HandCoins size={15} style={{ color: "#C9952A" }} />
          <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8" }}>
            Log Contribution
          </h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          {/* Amount + Currency row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 90px", gap: "8px" }}>
            <div>
              <label style={labelStyle}>Amount *</label>
              <input
                {...register("amount")}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="1000.00"
                style={fieldStyle}
              />
              {errors.amount && (
                <p style={{ fontSize: "10px", color: "#E07A5A", marginTop: "3px" }}>
                  {errors.amount.message}
                </p>
              )}
            </div>
            <div>
              <label style={labelStyle}>Currency</label>
              <select {...register("currency")} style={{ ...fieldStyle, cursor: "pointer" }}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Donor name */}
          <div>
            <label style={labelStyle}>Donor Name</label>
            <input
              {...register("donor_name")}
              placeholder="Optional"
              style={fieldStyle}
            />
          </div>

          {/* Donor email */}
          <div>
            <label style={labelStyle}>Donor Email</label>
            <input
              {...register("donor_email")}
              type="email"
              placeholder="Optional"
              style={fieldStyle}
            />
            {errors.donor_email && (
              <p style={{ fontSize: "10px", color: "#E07A5A", marginTop: "3px" }}>
                {errors.donor_email.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <label style={labelStyle}>Note</label>
            <input
              {...register("note")}
              placeholder="e.g. Bank transfer — John S."
              style={fieldStyle}
            />
          </div>

          {error && (
            <p style={{ fontSize: "11px", color: "#E07A5A", padding: "8px 10px", background: "rgba(160,65,42,0.1)", borderRadius: "6px" }}>
              {error}
            </p>
          )}

          {success && (
            <p style={{ fontSize: "11px", color: "#4AAF7A", padding: "8px 10px", background: "rgba(42,122,74,0.1)", borderRadius: "6px" }}>
              ✓ Contribution logged — progress updated
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              padding: "9px", borderRadius: "8px", border: "none",
              background: saving ? "rgba(201,149,42,0.4)" : "#C9952A",
              color: "#0D0D0D", fontSize: "12px", fontWeight: 500,
              cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            }}
          >
            {saving ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            {saving ? "Logging…" : "Log Contribution"}
          </button>
        </form>
      </div>

      {/* Contribution history */}
      <div style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "18px" }}>
        <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "14px" }}>
          Recent Contributions
        </h2>

        {contributions.length === 0 ? (
          <p style={{ fontSize: "12px", color: "#706B63", textAlign: "center", padding: "20px 0" }}>
            No contributions yet
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {contributions.map((c) => (
              <div
                key={c.id}
                style={{
                  display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                  padding: "10px 12px", borderRadius: "8px", background: "#1A1A1A",
                  border: "1px solid #242424",
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                    <span
                      style={{
                        fontSize: "9px", fontWeight: 600, padding: "1px 6px",
                        borderRadius: "99px", textTransform: "uppercase", letterSpacing: "0.08em",
                        background: c.source === "manual" ? "rgba(112,107,99,0.15)" : "rgba(42,122,74,0.12)",
                        color: c.source === "manual" ? "#706B63" : "#4AAF7A",
                      }}
                    >
                      {c.source}
                    </span>
                    {c.donor_name && (
                      <span style={{ fontSize: "11px", color: "#B8B3AC", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.donor_name}
                      </span>
                    )}
                  </div>
                  {c.note && (
                    <p style={{ fontSize: "11px", color: "#706B63", marginTop: "2px" }}>{c.note}</p>
                  )}
                  <p style={{ fontSize: "10px", color: "#4A4A44", marginTop: "3px" }}>
                    {formatDate(c.created_at, { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "12px" }}>
                  <p style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", fontFamily: "monospace" }}>
                    {formatCurrency(c.amount, c.currency)}
                  </p>
                  <p style={{ fontSize: "10px", color: "#706B63" }}>{c.currency}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}