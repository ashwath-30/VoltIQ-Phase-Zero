import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapDbBillToBill } from "@/lib/bills";
import { geocodeZip, findNearestNoaaStation, getDailyTemps, computeDegreeDays } from "@/lib/weather-history";
import { billingPeriodToDateRange, fitDegreeDayRegression, splitUsage, type DegreeDayPoint } from "@/lib/weather-regression";

// A pure diagnostic endpoint — visit /api/weather-regression-test directly
// in your browser while logged in. Not wired into any page yet. Shows the
// full pipeline: real bills -> real degree-days per billing month -> real
// regression -> real weather/baseline split, so we can verify the numbers
// look sensible before building the actual Analytics chart on top of it.
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
    return NextResponse.json(
      { error: "No ZIP code saved on your profile yet. Add one in Profile, then try again." },
      { status: 400 }
    );
  }

  const bills = (billRows ?? []).map(mapDbBillToBill);
  if (bills.length < 4) {
    return NextResponse.json(
      {
        error: `Need at least 4 processed bills for a meaningful regression — you have ${bills.length}. Upload more bills and try again.`,
      },
      { status: 400 }
    );
  }

  const coords = await geocodeZip(zipCode);
  if (!coords) {
    return NextResponse.json({ step: "geocode", error: "Couldn't convert that ZIP code to coordinates." }, { status: 500 });
  }

  // Find one station covering the FULL span from the earliest to the
  // latest bill, so the same station's data is used consistently across
  // every month rather than switching stations mid-history.
  const earliestRange = billingPeriodToDateRange(bills[0].billingPeriod);
  const latestRange = billingPeriodToDateRange(bills[bills.length - 1].billingPeriod);
  const station = await findNearestNoaaStation(coords, earliestRange.start, latestRange.end);

  if (!station) {
    return NextResponse.json(
      {
        step: "station lookup",
        coords,
        error: "Couldn't find a NOAA station with data across your full bill history range.",
      },
      { status: 500 }
    );
  }

  // Fetch real degree-days for each bill's billing month, one at a time.
  const points: DegreeDayPoint[] = [];
  const perBillDebug: Record<string, unknown>[] = [];

  for (const bill of bills) {
    const range = billingPeriodToDateRange(bill.billingPeriod);
    const dailyTemps = await getDailyTemps(station.id, range.start, range.end);
    const { hdd, cdd } = computeDegreeDays(dailyTemps);

    perBillDebug.push({
      billingPeriod: bill.billingPeriod,
      dateRange: range,
      daysOfDataFound: dailyTemps.length,
      hdd,
      cdd,
      totalKwh: bill.totalKwh,
    });

    points.push({
      billId: bill.id,
      billingPeriod: bill.billingPeriod,
      totalKwh: bill.totalKwh,
      hdd,
      cdd,
    });
  }

  const regression = fitDegreeDayRegression(points);
  if (!regression) {
    return NextResponse.json({
      step: "regression",
      error: "Couldn't fit a regression — not enough data variation.",
      station,
      perBillDebug,
    });
  }

  const splits = points.map((p) => splitUsage(p, regression));

  return NextResponse.json({
    zipCode,
    station,
    billsUsed: bills.length,
    regression,
    perBillDebug,
    splits,
  });
}
