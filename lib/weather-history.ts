import { requireEnv } from "@/lib/env";

/**
 * This pipeline uses NOAA (U.S. government, public domain) for the actual
 * historical weather records, and Zippopotam.us for ZIP-to-coordinates
 * lookup. Zippopotam.us is built on GeoNames data, licensed CC BY 4.0 —
 * commercial use is explicitly permitted under that license as long as
 * attribution is given (unlike Open-Meteo's free tier, which restricts
 * commercial use as a business-model choice separate from its data
 * license). Attribution: location lookups powered by GeoNames.org.
 *
 * Note: the Census Bureau's geocoder was tried first, but its address
 * API is built for full street addresses — it doesn't reliably resolve a
 * bare ZIP code with no street, which is exactly the failure this
 * replaced.
 */

interface Coordinates {
  lat: number;
  lon: number;
}

/**
 * Step 1: Convert a ZIP code to coordinates using Zippopotam.us, which
 * is purpose-built for exactly this lookup. No API key required.
 */
export async function geocodeZip(zipCode: string): Promise<Coordinates | null> {
  const url = `https://api.zippopotam.us/us/${encodeURIComponent(zipCode.trim())}`;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const place = data?.places?.[0];
    if (!place?.latitude || !place?.longitude) return null;
    return { lat: parseFloat(place.latitude), lon: parseFloat(place.longitude) };
  } catch (err) {
    console.error("ZIP geocoding error:", err);
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

  // Wider bounding box (~0.75 degrees, roughly 45 miles) — needed because
  // stations that actually report temperature (as opposed to rain-gauge-only
  // volunteer stations, which are far more numerous) are less common.
  const pad = 0.75;
  const extent = `${coords.lat - pad},${coords.lon - pad},${coords.lat + pad},${coords.lon + pad}`;
  // datatypeid=TMAX restricts results to stations that actually report
  // temperature — without this, the search can return a station that only
  // measures rainfall (common "US1..." volunteer rain-gauge stations),
  // which has real data but none of what we need.
  const url = `https://www.ncdc.noaa.gov/cdo-web/api/v2/stations?datasetid=GHCND&datatypeid=TMAX&extent=${extent}&limit=10&sortfield=datacoverage&sortorder=desc`;

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
