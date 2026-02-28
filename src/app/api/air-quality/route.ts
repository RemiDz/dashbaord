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
      `&timezone=auto`;

    const res = await fetch(url, { next: { revalidate: 1800 } });

    if (!res.ok) throw new Error(`Air quality API error: ${res.status}`);

    const data = await res.json();
    const current = data.current;

    return NextResponse.json({
      aqi: current?.european_aqi ?? null,
      pm25: current?.pm2_5 ?? null,
      pm10: current?.pm10 ?? null,
      no2: current?.nitrogen_dioxide ?? null,
      o3: current?.ozone ?? null,
    });
  } catch (error) {
    console.error("Air quality fetch error:", error);
    return NextResponse.json(
      { aqi: null, error: "Data temporarily unavailable" },
      { status: 200 },
    );
  }
}
