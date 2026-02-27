import { NextResponse } from "next/server";

/**
 * Tidal data API route.
 *
 * Supports two providers:
 *  1. NOAA Tides & Currents (default) — free, keyless, US stations only
 *  2. UK Admiralty Discovery API — free tier, requires key, UK stations
 *
 * Accepts optional ?lat=&lon= query params to auto-detect the nearest
 * NOAA tide station. Falls back to env vars or default station.
 */

// ── Types ──────────────────────────────────────────────────

interface TidalEvent {
  time: string;
  height: number;
  type: "high" | "low";
}

interface HourlyPoint {
  time: string;
  height: number;
}

interface TidalResponse {
  events: TidalEvent[];
  hourly: HourlyPoint[];
  location: string;
  error?: string;
}

interface NOAAStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// ── Date helpers ───────────────────────────────────────────

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ── Nearest station lookup ─────────────────────────────────

/** Haversine distance in km */
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** In-memory cache for station list (refreshed once per process lifecycle) */
let cachedStations: NOAAStation[] | null = null;
let cacheTime = 0;
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

async function getNOAAStations(): Promise<NOAAStation[]> {
  if (cachedStations && Date.now() - cacheTime < CACHE_TTL) {
    return cachedStations;
  }

  const res = await fetch(
    "https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations.json?type=tidepredictions",
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) return cachedStations ?? [];

  const data = await res.json();
  cachedStations = (data.stations ?? []).map(
    (s: { id: string; name: string; lat: number; lng: number }) => ({
      id: s.id,
      name: s.name,
      lat: s.lat,
      lng: s.lng,
    })
  );
  cacheTime = Date.now();
  return cachedStations!;
}

async function findNearestStation(
  lat: number,
  lon: number
): Promise<{ id: string; name: string } | null> {
  const stations = await getNOAAStations();
  if (stations.length === 0) return null;

  let nearest = stations[0];
  let minDist = Infinity;

  for (const s of stations) {
    const d = haversineKm(lat, lon, s.lat, s.lng);
    if (d < minDist) {
      minDist = d;
      nearest = s;
    }
  }

  return { id: nearest.id, name: nearest.name };
}

// ── NOAA provider ──────────────────────────────────────────

async function fetchNOAA(station: string, locationName: string): Promise<TidalResponse> {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

  const beginDate = formatDate(today);
  const endDate = formatDate(tomorrow);

  const base = "https://api.tidesandcurrents.noaa.gov/api/prod/datagetter";
  const common = `station=${station}&datum=MLLW&units=metric&time_zone=gmt&format=json`;

  // Fetch hi/lo events and hourly predictions in parallel
  const [hiloRes, hourlyRes] = await Promise.all([
    fetch(
      `${base}?begin_date=${beginDate}&end_date=${endDate}&product=predictions&interval=hilo&${common}`,
      { next: { revalidate: 1800 } }
    ),
    fetch(
      `${base}?begin_date=${beginDate}&end_date=${endDate}&product=predictions&interval=h&${common}`,
      { next: { revalidate: 1800 } }
    ),
  ]);

  if (!hiloRes.ok) throw new Error(`NOAA hilo error: ${hiloRes.status}`);
  if (!hourlyRes.ok) throw new Error(`NOAA hourly error: ${hourlyRes.status}`);

  const hiloData = await hiloRes.json();
  const hourlyData = await hourlyRes.json();

  const events: TidalEvent[] = (hiloData.predictions ?? []).map(
    (p: { t: string; v: string; type: string }) => ({
      time: p.t,
      height: parseFloat(p.v),
      type: p.type === "H" ? "high" : "low",
    })
  );

  const hourly: HourlyPoint[] = (hourlyData.predictions ?? []).map(
    (p: { t: string; v: string }) => ({
      time: p.t,
      height: parseFloat(p.v),
    })
  );

  return { events, hourly, location: locationName };
}

// ── Admiralty UK provider ──────────────────────────────────

async function fetchAdmiralty(
  station: string,
  apiKey: string
): Promise<TidalResponse> {
  const url = `https://admiraltyapi.azure-api.net/uktidalapi/api/V1/Stations/${station}/TidalEvents`;

  const res = await fetch(url, {
    headers: { "Ocp-Apim-Subscription-Key": apiKey },
    next: { revalidate: 1800 },
  });

  if (!res.ok) throw new Error(`Admiralty API error: ${res.status}`);

  const raw: {
    EventType: string;
    DateTime: string;
    Height: number;
  }[] = await res.json();

  const events: TidalEvent[] = raw.map((e) => ({
    time: e.DateTime,
    height: e.Height,
    type: e.EventType === "HighWater" ? "high" : "low",
  }));

  // Admiralty Discovery tier doesn't provide hourly data;
  // interpolate a curve from the hi/lo events for the sparkline
  const hourly = interpolateHourly(events);

  return { events, hourly, location: "Thames Estuary" };
}

/**
 * Interpolate hourly points from hi/lo events using cosine interpolation
 * to produce a smooth tidal curve for the sparkline.
 */
function interpolateHourly(events: TidalEvent[]): HourlyPoint[] {
  if (events.length < 2) return [];

  const points: HourlyPoint[] = [];
  const startTime = new Date(events[0].time).getTime();
  const endTime = new Date(events[events.length - 1].time).getTime();

  for (let t = startTime; t <= endTime; t += 3600000) {
    // Find surrounding events
    let before = events[0];
    let after = events[events.length - 1];

    for (let i = 0; i < events.length - 1; i++) {
      const tA = new Date(events[i].time).getTime();
      const tB = new Date(events[i + 1].time).getTime();
      if (t >= tA && t <= tB) {
        before = events[i];
        after = events[i + 1];
        break;
      }
    }

    const tA = new Date(before.time).getTime();
    const tB = new Date(after.time).getTime();
    const progress = tB > tA ? (t - tA) / (tB - tA) : 0;

    // Cosine interpolation for natural tidal curve
    const mu = (1 - Math.cos(progress * Math.PI)) / 2;
    const height = before.height * (1 - mu) + after.height * mu;

    points.push({
      time: new Date(t).toISOString(),
      height: parseFloat(height.toFixed(3)),
    });
  }

  return points;
}

// ── Route handler ──────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const provider = process.env.TIDAL_PROVIDER || "noaa";

  try {
    if (provider === "admiralty") {
      const apiKey = process.env.ADMIRALTY_API_KEY;
      const station = process.env.TIDAL_STATION_ID || "0113";

      if (!apiKey) {
        throw new Error("ADMIRALTY_API_KEY not set");
      }

      const data = await fetchAdmiralty(station, apiKey);
      return NextResponse.json(data);
    }

    // Default: NOAA — use nearest station if coordinates provided
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    let station = process.env.NOAA_TIDAL_STATION || "8518750";
    let locationName = "The Battery, New York";

    if (lat && lon) {
      const nearest = await findNearestStation(parseFloat(lat), parseFloat(lon));
      if (nearest) {
        station = nearest.id;
        locationName = nearest.name;
      }
    }

    const data = await fetchNOAA(station, locationName);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Tidal fetch error:", error);
    return NextResponse.json(
      {
        events: [],
        hourly: [],
        location: "Unknown",
        error: "Data temporarily unavailable",
      },
      { status: 200 }
    );
  }
}
