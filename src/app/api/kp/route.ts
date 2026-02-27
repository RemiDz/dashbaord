import { NextResponse } from "next/server";

const NOAA_KP_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

interface KpEntry {
  timestamp: string;
  kp: number;
}

export async function GET() {
  try {
    const res = await fetch(NOAA_KP_URL, { next: { revalidate: 900 } });

    if (!res.ok) throw new Error(`NOAA API error: ${res.status}`);

    const raw: string[][] = await res.json();

    // First row is headers: ["time_tag", "Kp", "a_running", "station_count"]
    const entries: KpEntry[] = raw.slice(1).map((row) => ({
      timestamp: row[0],
      kp: parseFloat(row[1]),
    }));

    // Last 24 entries = 3 days at 3h intervals (covers 24h sparkline with context)
    const history = entries.slice(-24);
    const current = entries[entries.length - 1]?.kp ?? null;

    return NextResponse.json({ current, history });
  } catch (error) {
    console.error("KP fetch error:", error);
    return NextResponse.json(
      { current: null, history: [], error: "Data temporarily unavailable" },
      { status: 200 }
    );
  }
}
