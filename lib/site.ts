"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveResult = { success: true } | { success: false; error: string };

/**
 * Update a batch of site_settings key/value pairs.
 * Only called from authenticated admin context — middleware enforces auth.
 */
export async function saveSiteSettings(
  entries: Record<string, string>
): Promise<SaveResult> {
  const supabase = await createClient();

  // Verify admin session server-side as an extra safety net
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorised" };
  }

  // Upsert all entries individually — site_settings has a unique key constraint
  const upserts = Object.entries(entries).map(([key, value]) =>
    supabase
      .from("site_settings")
      .upsert({ key, value }, { onConflict: "key" })
  );

  const results = await Promise.all(upserts);
  const firstError = results.find((r) => r.error)?.error;

  if (firstError) {
    console.error("saveSiteSettings error:", firstError.message);
    return { success: false, error: firstError.message };
  }

  // Revalidate all public pages that read from site_settings
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/donate");
  revalidatePath("/campaigns");
  revalidatePath("/blog");

  return { success: true };
}