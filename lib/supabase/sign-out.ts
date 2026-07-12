import { createClient } from "@/lib/supabase/client";
import { clearLoginTimestamp } from "@/lib/session-expiry";

export async function signOutAndRedirect(router: { push: (href: string) => void; refresh: () => void }) {
  const supabase = createClient();
  await supabase.auth.signOut();
  clearLoginTimestamp();
  router.push("/login");
  router.refresh();
}
