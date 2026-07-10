import { createClient } from "@/lib/supabase/client";

export async function signOutAndRedirect(router: { push: (href: string) => void; refresh: () => void }) {
  const supabase = createClient();
  await supabase.auth.signOut();
  router.push("/login");
  router.refresh();
}
