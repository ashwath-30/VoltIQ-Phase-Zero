import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireEnv } from "@/lib/env";
import { geocodeZip, findNearestNoaaStation, getDailyTemps, computeDegreeDays } from "@/lib/weather-history";

// A pure diagnostic endpoint — visit /api/weather-test directly in your
// browser while logged in to see each step of the pipeline succeed or
// fail, before anything else in the app depends on it. Uses your own
// saved ZIP code (stored in the existing "address" field, repurposed to
// hold just a ZIP code rather than a full street address — collecting
// only what's actually needed).
//
// The test window intentionally ends 60 days ago, not today — NOAA's
// historical database has a real, well-documented processing lag before
// daily records are published (commonly weeks, sometimes longer), so
// testing "the most recent 90 days" can show zero results even when the
// pipeline itself is completely correct. Looking further back avoids
// that false negative.
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
  endDate.setDate(endDate.getDate() - 60);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 150);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const dailyTemps = await getDailyTemps(station.id, fmt(startDate), fmt(endDate));
  const degreeDays = computeDegreeDays(dailyTemps);

  // If still empty, fetch the RAW NOAA response directly so we can see
  // exactly what came back, instead of guessing at another theory blind.
  let rawDebug: unknown = undefined;
  if (dailyTemps.length === 0) {
    const token = requireEnv(process.env.NOAA_API_TOKEN, "NOAA_API_TOKEN");
    const rawUrl = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=${station.id}&datatypeid=TMAX,TMIN&startdate=${fmt(
      startDate
    )}&enddate=${fmt(endDate)}&units=standard&limit=1000`;
    try {
      const rawResponse = await fetch(rawUrl, { headers: { token } });
      rawDebug = {
        status: rawResponse.status,
        body: await rawResponse.text(),
      };
    } catch (err) {
      rawDebug = { fetchError: String(err) };
    }
  }

  return NextResponse.json({
    zipCode,
    coords,
    station,
    testWindow: { start: fmt(startDate), end: fmt(endDate) },
    daysOfDataFound: dailyTemps.length,
    sampleDays: dailyTemps.slice(0, 3),
    degreeDays,
    rawDebug,
  });
}
