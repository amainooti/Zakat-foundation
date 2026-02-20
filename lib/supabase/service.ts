import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// !! SERVER ONLY — never import this in client components !!
// Uses the service role key — bypasses ALL RLS policies.
// Only use in: API route handlers (webhooks), cron jobs.

export function createServiceClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}