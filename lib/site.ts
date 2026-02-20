"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { success: true } | { success: false; error: string };

export async function saveSiteSettings(
  entries: Record<string, string>
): Promise<SaveResult> {
  const supabase = await createClient();

  // ── DEV BYPASS — re-enable before deploying ──────────────────
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) return { success: false, error: "Unauthorised" };

  const upserts = Object.entries(entries).map(([key, value]) =>
    supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" })
  );

  const results    = await Promise.all(upserts);
  const firstError = results.find((r) => r.error)?.error;

  if (firstError) {
    console.error("saveSiteSettings error:", firstError.message);
    return { success: false, error: firstError.message };
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/donate");
  revalidatePath("/campaigns");
  revalidatePath("/blog");

  return { success: true };
}