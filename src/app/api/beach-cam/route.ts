import { NextResponse } from "next/server";
import { getCurrentDaytimeBeach, getLocalTime } from "@/lib/beach-data";

/**
 * Beach Cam metadata route — returns current daytime beach info.
 * Only selects beaches where it's currently 07:00–18:00 local time.
 * Rotates every 5 minutes.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { beach, index, total } = getCurrentDaytimeBeach();

    // Fetch temperature from Open-Meteo (no key needed)
    let temp: number | null = null;
    try {
      const weatherUrl =
        `https://api.open-meteo.com/v1/forecast?latitude=${beach.lat}&longitude=${beach.lon}` +
        `&current=temperature_2m&timezone=auto`;
      const res = await fetch(weatherUrl, { next: { revalidate: 1800 } });
      if (res.ok) {
        const data = await res.json();
        temp = Math.round(data.current?.temperature_2m ?? 0);
      }
    } catch {
      // Temperature is non-critical
    }

    return NextResponse.json({
      name: beach.name,
      country: beach.country,
      localTime: getLocalTime(beach.utcOffset),
      temp,
      index,
      total,
    });
  } catch (error) {
    console.error("Beach cam error:", error);
    return NextResponse.json(
      { name: null, error: "Data temporarily unavailable" },
      { status: 200 },
    );
  }
}
