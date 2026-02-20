import { createClient } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types/app";

// ── Fetch all site settings as a typed map ────────────────────
// Use in Server Components — cached per request by Next.js
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value");

  if (error) {
    console.error("Failed to fetch site settings:", error.message);
    return {} as SiteSettings;
  }

  // Convert row array → typed key-value map
  return Object.fromEntries(
    (data ?? []).map((row) => [row.key, row.value ?? ""])
  ) as unknown as SiteSettings;
}

// ── Update a single setting (admin server actions) ────────────
export async function updateSiteSetting(
  key: keyof SiteSettings,
  value: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("site_settings")
    .update({ value })
    .eq("key", key);

  if (error) throw new Error(`Failed to update setting "${key}": ${error.message}`);
}

// ── Update multiple settings at once ─────────────────────────
export async function updateSiteSettings(
  updates: Partial<Record<keyof SiteSettings, string>>
) {
  const supabase = await createClient();

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value: value ?? "",
  }));

  const { error } = await supabase
    .from("site_settings")
    .upsert(rows, { onConflict: "key" });

  if (error) throw new Error(`Failed to update settings: ${error.message}`);
}