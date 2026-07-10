import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Uses the SERVICE ROLE key, which bypasses Row Level Security entirely.
// This must only ever be used in trusted, server-only background jobs
// (like the cron route next to this file) — never in a normal user-facing
// route, and never anywhere the browser could reach it.
export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
