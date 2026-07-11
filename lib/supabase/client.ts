import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

// Used inside client components (anything with "use client" at the top).
// Reads the two public keys from your .env.local file.
export function createClient() {
  return createBrowserClient(
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  );
}
