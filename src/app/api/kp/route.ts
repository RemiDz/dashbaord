import { NextResponse } from "next/server";

const NOAA_KP_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

interface KpEntry {
  timestamp: string;
  kp: number;
}

/**
 * NOAA's feed ships in two historical shapes — legacy `string[][]` with a
 * header row, and the current `{time_tag, Kp, ...}` object array. Tolerate
 * both so a silent format flip doesn't blank the panel.
 */
function parseKpFeed(raw: unknown): KpEntry[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];

  const out: KpEntry[] = [];
  for (const row of raw) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const obj = row as Record<string, unknown>;
      const ts = typeof obj.time_tag === "string" ? obj.time_tag : "";
      const kpRaw = obj.Kp ?? obj.kp ?? obj.kp_index;
      const kp = typeof kpRaw === "number" ? kpRaw : parseFloat(String(kpRaw));
      if (ts && !Number.isNaN(kp)) out.push({ timestamp: ts, kp });
    } else if (Array.isArray(row)) {
      const ts = typeof row[0] === "string" ? row[0] : "";
      const kp = parseFloat(String(row[1]));
      if (ts && !Number.isNaN(kp)) out.push({ timestamp: ts, kp });
    }
  }
  return out;
}

export async function GET() {
  try {
    const res = await fetch(NOAA_KP_URL, { next: { revalidate: 900 } });

    if (!res.ok) throw new Error(`NOAA API error: ${res.status}`);

    const raw: unknown = await res.json();
    const entries = parseKpFeed(raw);

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
