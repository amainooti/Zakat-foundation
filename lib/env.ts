// ============================================================
// env.ts — validates all required environment variables
// Import this at the top of lib/paystack.ts, lib/resend.ts etc.
// It throws at build/start time if anything is missing.
// ============================================================

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}\n` +
      `Add it to your .env.local file.`
    );
  }
  return value;
}

// Validated at module load — fails fast
export const env = {
  // Supabase
  SUPABASE_URL:              requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  SUPABASE_ANON_KEY:         requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  // Note: SERVICE_ROLE_KEY is only validated when createServiceClient() is called

  // Paystack
  PAYSTACK_SECRET_KEY:       requireEnv("PAYSTACK_SECRET_KEY"),
  NEXT_PUBLIC_PAYSTACK_KEY:  requireEnv("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"),

  // Resend
  RESEND_API_KEY:            requireEnv("RESEND_API_KEY"),
  RESEND_FROM_EMAIL:         requireEnv("RESEND_FROM_EMAIL"),

  // App
  SITE_URL:                  requireEnv("NEXT_PUBLIC_SITE_URL"),
} as const;