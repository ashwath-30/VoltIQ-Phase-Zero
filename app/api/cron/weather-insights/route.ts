import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { checkWeatherInsightForUser } from "@/lib/weather-insights-check";

/**
 * Runs once a day (see vercel.json) across every user who has a ZIP
 * code saved — checking bill count happens per-user inside
 * checkWeatherInsightForUser itself, same as the on-demand route, so
 * behavior is identical either way.
 *
 * Uses the ADMIN client (service-role key) since a scheduled job has no
 * browser session to read a "logged in user" from — this is the same
 * reason the existing check-stale-bills cron does the same thing.
 */
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) {
    // Logged server-side only — the caller still just gets a generic
    // Unauthorized, so this doesn't leak configuration details.
    console.error("Missing required environment variable: CRON_SECRET.");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, address")
    .not("address", "is", null)
    .neq("address", "");

  let usersChecked = 0;
  let notificationsCreated = 0;
  let errors = 0;

  for (const profile of profiles ?? []) {
    usersChecked += 1;
    try {
      const result = await checkWeatherInsightForUser(supabase, profile.id);
      if (result.status === "notification_created") notificationsCreated += 1;
      if (result.status === "error") errors += 1;
    } catch (err) {
      errors += 1;
      console.error(`Weather insight check failed for user ${profile.id}:`, err);
    }
  }

  return NextResponse.json({ usersChecked, notificationsCreated, errors });
}
