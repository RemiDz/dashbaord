import { NextResponse } from "next/server";

/**
 * Tidal data API route.
 *
 * Supports two providers:
 *  1. NOAA Tides & Currents (default) — free, keyless, US stations only
 *  2. UK Admiralty Discovery API — free tier, requires key, UK stations
 *
 * Set TIDAL_PROVIDER=admiralty and ADMIRALTY_API_KEY in .env.local for UK data.
 * Default: NOAA station 8518750 (The Battery, New York).
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

// ── Date helpers ───────────────────────────────────────────

function formatDate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

// ── NOAA provider ──────────────────────────────────────────

async function fetchNOAA(station: string): Promise<TidalResponse> {
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

  return { events, hourly, location: "The Battery, New York" };
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

export async function GET() {
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

    // Default: NOAA
    const station = process.env.NOAA_TIDAL_STATION || "8518750";
    const data = await fetchNOAA(station);
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
