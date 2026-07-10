import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STALE_THRESHOLD_DAYS = 35;
const RENOTIFY_COOLDOWN_DAYS = 7;

/**
 * This is the "real background process" piece of notifications, as
 * opposed to the reactive check that runs immediately after each bill
 * upload (see app/api/upload-bill/route.ts). It looks across every user
 * — something only possible with the service-role key, since normal
 * requests are correctly restricted to a single user's own data — and
 * flags anyone whose most recent bill (or account, if they have none
 * yet) is more than 35 days old.
 *
 * Locally, this only runs when you manually call it (see README). Once
 * deployed to Vercel with the cron schedule in vercel.json, it runs
 * automatically on that schedule without you doing anything.
 */
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    // Logged server-side only — the caller still just gets a generic
    // Unauthorized, so this doesn't leak configuration details to
    // whoever is making the request.
    console.error(
      "Missing required environment variable: CRON_SECRET. Add it to your .env.local (see .env.local.example), then restart your dev server."
    );
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: profiles } = await supabase.from("profiles").select("id, created_at");

  let notificationsCreated = 0;

  for (const profile of profiles ?? []) {
    const { data: latestBill } = await supabase
      .from("bills")
      .select("upload_date")
      .eq("user_id", profile.id)
      .order("upload_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastActivity = latestBill?.upload_date ?? profile.created_at;
    const daysSinceActivity = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceActivity < STALE_THRESHOLD_DAYS) continue;

    const { data: recentReminder } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", profile.id)
      .eq("title", "Time for a new bill upload")
      .gte("created_at", new Date(Date.now() - RENOTIFY_COOLDOWN_DAYS * 24 * 60 * 60 * 1000).toISOString())
      .limit(1);

    if (recentReminder && recentReminder.length > 0) continue;

    await supabase.from("notifications").insert({
      user_id: profile.id,
      type: "system",
      title: "Time for a new bill upload",
      description: `It's been ${Math.round(
        daysSinceActivity
      )} days since your last bill — upload a new one to keep your forecast and Energy Health Score up to date.`,
      severity: "info",
      timestamp: new Date().toISOString(),
      read: false,
    });
    notificationsCreated++;
  }

  return NextResponse.json({ usersChecked: profiles?.length ?? 0, notificationsCreated });
}
