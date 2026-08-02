import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDbBillToBill } from "@/lib/bills";
import { geocodeZip, findNearestNoaaStation, getDailyTemps, computeDegreeDays } from "@/lib/weather-history";
import {
  billingPeriodToDateRange,
  fitDegreeDayRegression,
  splitUsage,
  type DegreeDayPoint,
  type UsageSplit,
} from "@/lib/weather-regression";

const BASELINE_INCREASE_THRESHOLD = 0.1; // 10%
export const WEATHER_NOTIFICATION_TITLE = "Your baseline usage rose — not the weather";

export interface WeatherInsightResult {
  status: "skipped" | "error" | "no_notification" | "notification_created";
  reason?: string;
  step?: string;
  latest?: UsageSplit;
  avgPreviousBaseline?: number;
  percentChange?: number;
}

/**
 * Computes the real degree-day regression for ONE user and, if their
 * most recent bill shows a genuine rise in BASELINE (non-weather) usage,
 * creates a real notification saying so.
 *
 * IMPORTANT: every query here explicitly filters by user_id. The
 * on-demand route (session-scoped client) would be protected by Row
 * Level Security even without this, but the cron job passes an
 * admin/service-role client, which intentionally BYPASSES RLS entirely
 * — so this function can't rely on RLS to scope anything. Explicit
 * filtering here keeps it correct and safe regardless of which kind of
 * client calls it.
 */
export async function checkWeatherInsightForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<WeatherInsightResult> {
  const [{ data: profile }, { data: billRows }] = await Promise.all([
    supabase.from("profiles").select("address").eq("id", userId).single(),
    supabase
      .from("bills")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "processed")
      .order("billing_period", { ascending: true }),
  ]);

  const zipCode = profile?.address?.trim();
  if (!zipCode) {
    return { status: "skipped", reason: "No ZIP code saved on profile yet." };
  }

  const bills = (billRows ?? []).map(mapDbBillToBill);
  if (bills.length < 4) {
    return {
      status: "skipped",
      reason: `Need at least 4 processed bills for a meaningful regression — have ${bills.length}.`,
    };
  }

  const coords = await geocodeZip(zipCode);
  if (!coords) {
    return { status: "error", step: "geocode" };
  }

  const earliestRange = billingPeriodToDateRange(bills[0].billingPeriod);
  const latestRange = billingPeriodToDateRange(bills[bills.length - 1].billingPeriod);
  const station = await findNearestNoaaStation(coords, earliestRange.start, latestRange.end);
  if (!station) {
    return { status: "error", step: "station lookup" };
  }

  const points: DegreeDayPoint[] = [];
  for (const bill of bills) {
    const range = billingPeriodToDateRange(bill.billingPeriod);
    const dailyTemps = await getDailyTemps(station.id, range.start, range.end);
    const { hdd, cdd } = computeDegreeDays(dailyTemps);
    points.push({ billId: bill.id, billingPeriod: bill.billingPeriod, totalKwh: bill.totalKwh, hdd, cdd });
  }

  const regression = fitDegreeDayRegression(points);
  if (!regression) {
    return { status: "skipped", reason: "Not enough data variation to fit a regression." };
  }

  const splits = points.map((p) => splitUsage(p, regression));

  // Cache the full breakdown so the Analytics page can read it instantly
  // instead of re-running this entire multi-API pipeline on every page
  // load. Refreshed every time this function runs successfully,
  // independent of whether a notification also gets created below.
  await supabase
    .from("profiles")
    .update({
      weather_insight_cache: {
        splits,
        rSquared: regression.rSquared,
        computedAt: new Date().toISOString(),
      },
    })
    .eq("id", userId);

  const latest = splits[splits.length - 1];
  const previous = splits.slice(0, -1);
  const avgPreviousBaseline = previous.reduce((sum, s) => sum + s.baselineKwh, 0) / previous.length;

  if (avgPreviousBaseline <= 0) {
    return { status: "skipped", reason: "No meaningful baseline to compare against." };
  }

  const percentChange = (latest.baselineKwh - avgPreviousBaseline) / avgPreviousBaseline;

  if (percentChange < BASELINE_INCREASE_THRESHOLD) {
    return {
      status: "no_notification",
      reason: "Baseline usage hasn't meaningfully increased.",
      latest,
      avgPreviousBaseline: Math.round(avgPreviousBaseline),
      percentChange: Math.round(percentChange * 100),
    };
  }

  // Avoid creating a duplicate if we already flagged this same user
  // recently — explicitly scoped to this user_id, same reasoning as above.
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", userId)
    .eq("title", WEATHER_NOTIFICATION_TITLE)
    .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (!existing || existing.length === 0) {
    await supabase.from("notifications").insert({
      user_id: userId,
      type: "usage",
      title: WEATHER_NOTIFICATION_TITLE,
      description: `After accounting for weather, your baseline usage (everything besides heating/cooling) rose about ${Math.round(
        percentChange * 100
      )}% for ${latest.billingPeriod} compared to your recent average. This isn't explained by temperature — worth checking for a new appliance, a change in occupancy, or something left running.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  return {
    status: "notification_created",
    latest,
    avgPreviousBaseline: Math.round(avgPreviousBaseline),
    percentChange: Math.round(percentChange * 100),
  };
}
