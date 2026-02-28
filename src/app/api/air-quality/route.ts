import { NextResponse } from "next/server";

/**
 * Air Quality API route — powered by Open-Meteo (free, no key required).
 * https://open-meteo.com/en/docs/air-quality-api
 */

const AIR_QUALITY_BASE = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || process.env.WEATHER_LAT || "51.5074";
  const lon = searchParams.get("lon") || process.env.WEATHER_LON || "-0.1278";

  try {
    const url =
      `${AIR_QUALITY_BASE}?latitude=${lat}&longitude=${lon}` +
      `&current=european_aqi,pm10,pm2_5,nitrogen_dioxide,ozone` +
      `&hourly=european_aqi` +
      `&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);

    const data = await res.json();
    const current = data.current;

    // Extract last 24 hours of hourly AQI
    let hourlyAqi: number[] = [];
    if (data.hourly?.european_aqi && data.hourly?.time) {
      const now = new Date();
      const times: string[] = data.hourly.time;
      const values: (number | null)[] = data.hourly.european_aqi;

      // Find entries within the last 24 hours
      const cutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      for (let i = 0; i < times.length; i++) {
        const t = new Date(times[i]);
        if (t >= cutoff && t <= now && values[i] !== null) {
          hourlyAqi.push(values[i] as number);
        }
      }
    }

    return NextResponse.json({
      aqi: current?.european_aqi ?? null,
      pm25: current?.pm2_5 ?? null,
      pm10: current?.pm10 ?? null,
      no2: current?.nitrogen_dioxide ?? null,
      o3: current?.ozone ?? null,
      hourlyAqi,
    });
  } catch (error) {
    console.error("Air quality fetch error:", error);
    return NextResponse.json(
      { aqi: null, error: "Data temporarily unavailable" },
      { status: 200 },
    );
  }
}
