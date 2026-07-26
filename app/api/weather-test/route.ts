import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { geocodeZip, findNearestNoaaStation, getDailyTemps, computeDegreeDays } from "@/lib/weather-history";

// A pure diagnostic endpoint — visit /api/weather-test directly in your
// browser while logged in to see each step of the pipeline succeed or
// fail, before anything else in the app depends on it. Uses your own
// saved ZIP code (stored in the existing "address" field, repurposed to
// hold just a ZIP code rather than a full street address — collecting
// only what's actually needed) and the last 30 days as a quick, real test.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("address").eq("id", user.id).single();
  const zipCode = profile?.address?.trim();
  if (!zipCode) {
    return NextResponse.json(
      { error: "No ZIP code saved on your profile yet. Add one in Profile, then try again." },
      { status: 400 }
    );
  }

  const coords = await geocodeZip(zipCode);
  if (!coords) {
    return NextResponse.json({ step: "geocode", error: "Couldn't convert that ZIP code to coordinates." }, { status: 500 });
  }

  const station = await findNearestNoaaStation(coords);
  if (!station) {
    return NextResponse.json(
      { step: "station lookup", coords, error: "Couldn't find a nearby NOAA weather station." },
      { status: 500 }
    );
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const dailyTemps = await getDailyTemps(station.id, fmt(startDate), fmt(endDate));
  const degreeDays = computeDegreeDays(dailyTemps);

  return NextResponse.json({
    zipCode,
    coords,
    station,
    daysOfDataFound: dailyTemps.length,
    sampleDays: dailyTemps.slice(0, 3),
    degreeDays,
  });
}
