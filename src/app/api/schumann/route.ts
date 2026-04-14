import { NextResponse } from "next/server";

/**
 * Schumann Resonance API route.
 *
 * No public REST API provides structured Schumann resonance data.
 * We derive a realistic synthetic signal:
 *   - Base frequency: 7.83 Hz (fundamental Schumann mode)
 *   - Modulated by live geomagnetic (Kp) activity from NOAA
 *   - Kp storms widen/shift the resonance; calm conditions keep it near 7.83
 *   - Diurnal variation added (ionospheric height changes with solar illumination)
 *
 * This gives a physically-motivated signal tied to real geomagnetic conditions
 * rather than pure random data.
 */

const NOAA_KP_URL =
  "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json";

const BASE_FREQ = 7.83;

interface SchumannEntry {
  timestamp: string;
  frequency: number;
}

/**
 * Seed-based pseudo-random for deterministic variation within a 30-min slot.
 * Simple mulberry32 PRNG.
 */
function seededRandom(seed: number): number {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/**
 * NOAA ships Kp either as `[[headers],[values]...]` or as
 * `[{time_tag, Kp, ...}, ...]`. When the format flipped to objects the
 * legacy `row[1]` path produced `NaN`, which JSON-serialised to `null`
 * and blanked both this panel and the Schumann-derived signal downstream.
 */
function extractKpValues(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];
  const values: number[] = [];
  for (const row of raw) {
    let kp: number | null = null;
    if (row && typeof row === "object" && !Array.isArray(row)) {
      const obj = row as Record<string, unknown>;
      const kpRaw = obj.Kp ?? obj.kp ?? obj.kp_index;
      const parsed = typeof kpRaw === "number" ? kpRaw : parseFloat(String(kpRaw));
      if (!Number.isNaN(parsed)) kp = parsed;
    } else if (Array.isArray(row)) {
      const parsed = parseFloat(String(row[1]));
      if (!Number.isNaN(parsed)) kp = parsed;
    }
    if (kp !== null) values.push(kp);
  }
  return values;
}

export async function GET() {
  try {
    // Fetch real Kp data to modulate the Schumann signal
    let kpValues: number[] = [];
    try {
      const kpRes = await fetch(NOAA_KP_URL, { next: { revalidate: 900 } });
      if (kpRes.ok) {
        const raw: unknown = await kpRes.json();
        kpValues = extractKpValues(raw);
      }
    } catch {
      // If Kp fetch fails, we'll use default modulation
    }

    // Current Kp (or default calm value)
    const currentKp = kpValues.length > 0 ? kpValues[kpValues.length - 1] : 1.5;

    // Generate 48 data points: 24 hours at 30-min intervals, ending at "now"
    const now = new Date();
    const entries: SchumannEntry[] = [];

    for (let i = 0; i < 48; i++) {
      const pointTime = new Date(now.getTime() - (47 - i) * 30 * 60 * 1000);
      const hour = pointTime.getUTCHours() + pointTime.getUTCMinutes() / 60;

      // Diurnal variation: ionosphere is lower at night → frequency shifts slightly
      // Peak deviation around local noon, minimum at midnight
      const diurnal = Math.sin(((hour - 6) / 24) * Math.PI * 2) * 0.15;

      // Kp modulation: higher Kp → more deviation from base
      // Map the Kp values to a smooth influence across the 48 points
      const kpIdx = Math.min(
        kpValues.length - 1,
        Math.floor((i / 48) * kpValues.length)
      );
      const kpInfluence = kpValues.length > 0 ? kpValues[Math.max(0, kpIdx)] : currentKp;
      const kpDeviation = (kpInfluence / 9) * 0.6; // Max ±0.6 Hz at Kp 9

      // Deterministic "noise" seeded by the 30-min slot
      const slot = Math.floor(pointTime.getTime() / (30 * 60 * 1000));
      const noise = (seededRandom(slot) - 0.5) * 0.4;

      // Combine
      const frequency = BASE_FREQ + diurnal + kpDeviation + noise;

      entries.push({
        timestamp: pointTime.toISOString(),
        frequency: parseFloat(frequency.toFixed(3)),
      });
    }

    const current = entries[entries.length - 1].frequency;

    return NextResponse.json({ current, history: entries });
  } catch (error) {
    console.error("Schumann fetch error:", error);
    return NextResponse.json(
      { current: null, history: [], error: "Data temporarily unavailable" },
      { status: 200 }
    );
  }
}
