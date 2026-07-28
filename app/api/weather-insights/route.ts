import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapDbBillToBill } from "@/lib/bills";
import { geocodeZip, findNearestNoaaStation, getDailyTemps, computeDegreeDays } from "@/lib/weather-history";
import { billingPeriodToDateRange, fitDegreeDayRegression, splitUsage, type DegreeDayPoint } from "@/lib/weather-regression";

const BASELINE_INCREASE_THRESHOLD = 0.1; // 10%

/**
 * Computes the real degree-day regression and, if the user's most recent
 * bill shows a genuine rise in BASELINE (non-weather) usage compared to
 * their own history, creates a real notification saying so.
 *
 * Deliberately separate from bill upload and from the AI Assistant's
 * chat route — this makes several external API calls (geocoding, NOAA
 * lookups per billing month) and isn't fast. Keeping it as its own
 * on-demand endpoint means neither uploading a bill nor sending a chat
 * message gets slowed down waiting on this. The Assistant reads the
 * notification this creates rather than re-running the whole regression
 * on every message.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const [{ data: profile }, { data: billRows }] = await Promise.all([
    supabase.from("profiles").select("address").eq("id", user.id).single(),
    supabase.from("bills").select("*").eq("status", "processed").order("billing_period", { ascending: true }),
  ]);

  const zipCode = profile?.address?.trim();
  if (!zipCode) {
    return NextResponse.json({ status: "skipped", reason: "No ZIP code saved on profile yet." });
  }

  const bills = (billRows ?? []).map(mapDbBillToBill);
  if (bills.length < 4) {
    return NextResponse.json({
      status: "skipped",
      reason: `Need at least 4 processed bills for a meaningful regression — have ${bills.length}.`,
    });
  }

  const coords = await geocodeZip(zipCode);
  if (!coords) {
    return NextResponse.json({ status: "error", step: "geocode" }, { status: 500 });
  }

  const earliestRange = billingPeriodToDateRange(bills[0].billingPeriod);
  const latestRange = billingPeriodToDateRange(bills[bills.length - 1].billingPeriod);
  const station = await findNearestNoaaStation(coords, earliestRange.start, latestRange.end);
  if (!station) {
    return NextResponse.json({ status: "error", step: "station lookup" }, { status: 500 });
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
    return NextResponse.json({ status: "skipped", reason: "Not enough data variation to fit a regression." });
  }

  const splits = points.map((p) => splitUsage(p, regression));
  const latest = splits[splits.length - 1];
  const previous = splits.slice(0, -1);
  const avgPreviousBaseline = previous.reduce((sum, s) => sum + s.baselineKwh, 0) / previous.length;

  if (avgPreviousBaseline <= 0) {
    return NextResponse.json({ status: "skipped", reason: "No meaningful baseline to compare against." });
  }

  const percentChange = (latest.baselineKwh - avgPreviousBaseline) / avgPreviousBaseline;

  if (percentChange < BASELINE_INCREASE_THRESHOLD) {
    return NextResponse.json({
      status: "no_notification",
      reason: "Baseline usage hasn't meaningfully increased.",
      latest,
      avgPreviousBaseline: Math.round(avgPreviousBaseline),
      percentChange: Math.round(percentChange * 100),
    });
  }

  // Avoid creating a duplicate if we already flagged this same billing
  // period recently.
  const title = "Your baseline usage rose — not the weather";
  const { data: existing } = await supabase
    .from("notifications")
    .select("id")
    .eq("user_id", user.id)
    .eq("title", title)
    .gte("timestamp", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(1);

  if (!existing || existing.length === 0) {
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "usage",
      title,
      description: `After accounting for weather, your baseline usage (everything besides heating/cooling) rose about ${Math.round(
        percentChange * 100
      )}% for ${latest.billingPeriod} compared to your recent average. This isn't explained by temperature — worth checking for a new appliance, a change in occupancy, or something left running.`,
      severity: "warning",
      timestamp: new Date().toISOString(),
      read: false,
    });
  }

  return NextResponse.json({
    status: "notification_created",
    latest,
    avgPreviousBaseline: Math.round(avgPreviousBaseline),
    percentChange: Math.round(percentChange * 100),
  });
}
