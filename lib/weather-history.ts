import { requireEnv } from "@/lib/env";

/**
 * This whole pipeline deliberately uses ONLY U.S. government data sources
 * (Census Bureau geocoding, NOAA historical weather records) — both are
 * public domain federal government work, same legal category as the
 * DOE/ENERGY STAR data used in Mission 2. This was a deliberate choice
 * over a third-party weather API (like Open-Meteo) whose free tier is
 * explicitly restricted to non-commercial use — since VoltIQX now has a
 * real paid Pro tier, that restriction would actually apply to us.
 */

interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Step 1: Convert a ZIP code to coordinates using the Census Bureau's
 * free, public geocoding service. No API key required.
 */
export async function geocodeZip(zipCode: string): Promise<Coordinates | null> {
  const url = `https://geocoding.geo.census.gov/geocoder/locations/address?street=&city=&state=&zip=${encodeURIComponent(
    zipCode
  )}&benchmark=Public_AR_Current&format=json`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const match = data?.result?.addressMatches?.[0];
    if (!match?.coordinates) return null;
    return { lat: match.coordinates.y, lon: match.coordinates.x };
  } catch (err) {
    console.error("Census geocoding error:", err);
    return null;
  }
}

interface NoaaStation {
  id: string;
  name: string;
}

/**
 * Step 2: Find the nearest NOAA weather station with daily temperature
 * records, using NOAA's Climate Data Online (CDO) API. Requires a free
 * token (see .env.local.example) — signing up takes about a minute and
 * doesn't require payment info, just an email address.
 */
export async function findNearestNoaaStation(coords: Coordinates): Promise<NoaaStation | null> {
  const token = requireEnv(process.env.NOAA_API_TOKEN, "NOAA_API_TOKEN");

  // Small bounding box (~0.5 degrees, roughly 30 miles) around the point.
  const pad = 0.5;
  const extent = `${coords.lat - pad},${coords.lon - pad},${coords.lat + pad},${coords.lon + pad}`;
  const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?datasetid=GHCND&extent=${extent}&limit=5&sortfield=datacoverage&sortorder=desc`;

  try {
    const response = await fetch(url, { headers: { token } });
    if (!response.ok) return null;
    const data = await response.json();
    const station = data?.results?.[0];
    if (!station) return null;
    return { id: station.id, name: station.name };
  } catch (err) {
    console.error("NOAA station lookup error:", err);
    return null;
  }
}

export interface DailyTemp {
  date: string; // YYYY-MM-DD
  tmaxF: number;
  tminF: number;
}

/**
 * Step 3: Fetch real daily high/low temperatures for a station over a
 * date range from NOAA's historical records.
 */
export async function getDailyTemps(
  stationId: string,
  startDate: string,
  endDate: string
): Promise<DailyTemp[]> {
  const token = requireEnv(process.env.NOAA_API_TOKEN, "NOAA_API_TOKEN");
  const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/data?datasetid=GHCND&stationid=${stationId}&datatypeid=TMAX,TMIN&startdate=${startDate}&enddate=${endDate}&units=standard&limit=1000`;

  try {
    const response = await fetch(url, { headers: { token } });
    if (!response.ok) return [];
    const data = await response.json();
    const results: { date: string; datatype: string; value: number }[] = data?.results ?? [];

    const byDate: Record<string, { tmax?: number; tmin?: number }> = {};
    for (const r of results) {
      const day = r.date.slice(0, 10);
      byDate[day] = byDate[day] ?? {};
      if (r.datatype === "TMAX") byDate[day].tmax = r.value;
      if (r.datatype === "TMIN") byDate[day].tmin = r.value;
    }

    return Object.entries(byDate)
      .filter(([, v]) => v.tmax != null && v.tmin != null)
      .map(([date, v]) => ({ date, tmaxF: v.tmax as number, tminF: v.tmin as number }));
  } catch (err) {
    console.error("NOAA daily temps error:", err);
    return [];
  }
}

/**
 * Computes heating degree days (HDD) and cooling degree days (CDD) from
 * real daily temperatures — the standard building-energy-analysis
 * calculation (base 65°F is the conventional default used in this
 * field). HDD represents how much heating demand a day likely created;
 * CDD represents cooling demand.
 */
export function computeDegreeDays(dailyTemps: DailyTemp[], baseTempF = 65): { hdd: number; cdd: number } {
  let hdd = 0;
  let cdd = 0;

  for (const day of dailyTemps) {
    const avgTemp = (day.tmaxF + day.tminF) / 2;
    if (avgTemp < baseTempF) hdd += baseTempF - avgTemp;
    if (avgTemp > baseTempF) cdd += avgTemp - baseTempF;
  }

  return { hdd: Math.round(hdd), cdd: Math.round(cdd) };
}
