import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkWeatherInsightForUser } from "@/lib/weather-insights-check";

/**
 * On-demand version, for manually testing your own account. The
 * automatic daily version (all users, no browser session) is
 * app/api/cron/weather-insights — both call the same shared logic in
 * lib/weather-insights-check.ts, so behavior stays identical between
 * "test it yourself" and "runs automatically for everyone."
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const result = await checkWeatherInsightForUser(supabase, user.id);
  return NextResponse.json(result);
}
