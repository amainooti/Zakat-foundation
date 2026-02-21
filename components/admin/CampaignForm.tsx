"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { campaignSchema, type CampaignFormData } from "@/lib/validations/campaign";
import type { Campaign } from "@/lib/types/app";
import { Loader2 } from "lucide-react";

const CATEGORIES = ["Medical", "Education", "Shelter", "Food", "Water", "Yemen", "Gaza", "Syria", "Sudan", "Somalia", "Emergency", "Other"];
const STATUSES   = [
  { value: "active",    label: "Active"    },
  { value: "urgent",    label: "Urgent"    },
  { value: "completed", label: "Completed" },
  { value: "archived",  label: "Archived"  },
];

interface Props {
  campaign?: Campaign; // if provided → edit mode
}

export default function CampaignForm({ campaign }: Props) {
  const router   = useRouter();
  const supabase = createClient();
  const isEdit   = !!campaign;

  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [tagInput, setTagInput] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema) as any,
    defaultValues: isEdit ? {
      title:         campaign.title,
      slug:          campaign.slug,
      subtitle:      campaign.subtitle      ?? "",
      description:   campaign.description   ?? "",
      cover_image:   campaign.cover_image   ?? "",
      location:      campaign.location      ?? "",
      status:        campaign.status as "active" | "urgent" | "completed" | "archived",
      category:      campaign.category      ?? "",
      tags:          campaign.tags          ?? [],
      target_amount: campaign.target_amount,
      is_featured:   campaign.is_featured,
    } : {
      status:      "active",
      tags:        [],
      is_featured: false,
    },
  });

  const tags        = watch("tags") ?? [];
  const titleValue  = watch("title") ?? "";

  // Auto-generate slug from title (create mode only)
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    register("title").onChange(e);
    if (!isEdit) setValue("slug", slugify(val));
  }

  function addTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setValue("tags", [...tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag));
  }

  async function onSubmit(data: CampaignFormData) {
    setSaving(true);
    setError("");

    try {
      if (isEdit) {
        const { error: err } = await supabase
          .from("campaigns")
          .update({ ...data, updated_at: new Date().toISOString() })
          .eq("id", campaign.id);
        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from("campaigns")
          .insert({ ...data });
        if (err) throw err;
      }
      router.push("/admin/campaigns");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  // ── Field style helpers ──────────────────────────────────────
  const fieldStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: "8px",
    background: "#1F1F1F", border: "1px solid #2A2A2A",
    color: "#F0EDE8", fontSize: "13px", fontFamily: "inherit",
    outline: "none", transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "11px", fontWeight: 500,
    color: "#B8B3AC", marginBottom: "6px",
  };
  const errorStyle: React.CSSProperties = {
    fontSize: "11px", color: "#E07A5A", marginTop: "4px",
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px", alignItems: "start" }}>

        {/* ── Left column — main fields ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* Title */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "20px" }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "16px" }}>
              Campaign Details
            </h2>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Title *</label>
              <input
                {...register("title")}
                onChange={handleTitleChange}
                placeholder="e.g. Building Safe Shelters in Yemen"
                style={fieldStyle}
              />
              {errors.title && <p style={errorStyle}>{errors.title.message}</p>}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Slug *</label>
              <input
                {...register("slug")}
                placeholder="building-safe-shelters-in-yemen"
                style={{ ...fieldStyle, fontFamily: "monospace", fontSize: "12px" }}
              />
              {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={labelStyle}>Subtitle</label>
              <input
                {...register("subtitle")}
                placeholder="Short one-line description"
                style={fieldStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Location</label>
              <input
                {...register("location")}
                placeholder="e.g. Sana'a, Yemen"
                style={fieldStyle}
              />
            </div>
          </div>

          {/* Description — Tiptap will replace this textarea later */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "20px" }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "16px" }}>
              Description
            </h2>
            <textarea
              {...register("description")}
              placeholder="Describe this campaign in detail…"
              rows={8}
              style={{ ...fieldStyle, resize: "vertical", lineHeight: 1.6 }}
            />
          </div>

          {/* Cover image */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "20px" }}
          >
            <h2 style={{ fontSize: "13px", fontWeight: 600, color: "#F0EDE8", marginBottom: "16px" }}>
              Cover Image
            </h2>
            <input
              {...register("cover_image")}
              placeholder="https://… or pick from media library"
              style={fieldStyle}
            />
            {watch("cover_image") && (
              <img
                src={watch("cover_image")}
                alt="Cover preview"
                style={{ marginTop: "12px", width: "100%", height: "180px", objectFit: "cover", borderRadius: "8px" }}
              />
            )}
          </div>
        </div>

        {/* ── Right column — meta ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Publish / Save */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            {error && (
              <p style={{ ...errorStyle, marginBottom: "12px", padding: "10px 12px", background: "rgba(160,65,42,0.1)", borderRadius: "8px", border: "1px solid rgba(160,65,42,0.2)" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={saving}
              style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                padding: "10px", borderRadius: "8px", border: "none",
                background: saving ? "rgba(201,149,42,0.5)" : "#C9952A",
                color: "#0D0D0D", fontSize: "13px", fontWeight: 500,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Campaign"}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              style={{
                width: "100%", marginTop: "8px", padding: "8px",
                borderRadius: "8px", border: "1px solid #2A2A2A",
                background: "transparent", color: "#706B63",
                fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancel
            </button>
          </div>

          {/* Status */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            <label style={labelStyle}>Status</label>
            <select
              {...register("status")}
              style={{ ...fieldStyle, cursor: "pointer" }}
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Funding */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            <h2 style={{ fontSize: "12px", fontWeight: 600, color: "#F0EDE8", marginBottom: "14px" }}>
              Funding Goal
            </h2>
            <label style={labelStyle}>Target Amount (USD) *</label>
            <input
              {...register("target_amount")}
              type="number"
              min="1"
              step="0.01"
              placeholder="20000"
              style={fieldStyle}
            />
            {errors.target_amount && <p style={errorStyle}>{errors.target_amount.message}</p>}
          </div>

          {/* Category */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            <label style={labelStyle}>Category</label>
            <select {...register("category")} style={{ ...fieldStyle, cursor: "pointer" }}>
              <option value="">Select category…</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                style={{ ...fieldStyle, flex: 1 }}
              />
              <button
                type="button"
                onClick={addTag}
                style={{
                  padding: "9px 12px", borderRadius: "8px", border: "1px solid #2A2A2A",
                  background: "#2A2A2A", color: "#B8B3AC", fontSize: "12px",
                  cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                }}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: "4px",
                      padding: "3px 8px", borderRadius: "99px",
                      background: "rgba(201,149,42,0.1)", border: "1px solid rgba(201,149,42,0.2)",
                      color: "#C9952A", fontSize: "11px",
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Featured toggle */}
          <div
            style={{ background: "#161616", border: "1px solid #2A2A2A", borderRadius: "12px", padding: "16px" }}
          >
            <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
              <input
                type="checkbox"
                {...register("is_featured")}
                style={{ width: 16, height: 16, accentColor: "#C9952A" }}
              />
              <div>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#F0EDE8" }}>Featured</p>
                <p style={{ fontSize: "11px", color: "#706B63" }}>Show on homepage</p>
              </div>
            </label>
          </div>

        </div>
      </div>
    </form>
  );
}