import { NextResponse } from "next/server";

/**
 * Weather API route — powered by Open-Meteo (free, no API key required).
 * https://open-meteo.com/
 */

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/reverse";

// WMO Weather interpretation codes → emoji
// https://open-meteo.com/en/docs#weathervariables
function wmoEmoji(code: number): string {
  if (code === 0) return "\u2600\uFE0F"; // clear sky
  if (code <= 3) return code === 1 ? "\uD83C\uDF24\uFE0F" : "\u26C5"; // partly cloudy
  if (code <= 49) return "\uD83C\uDF2B\uFE0F"; // fog
  if (code <= 59) return "\uD83C\uDF26\uFE0F"; // drizzle
  if (code <= 69) return "\uD83C\uDF27\uFE0F"; // rain
  if (code <= 79) return "\u2744\uFE0F"; // snow
  if (code <= 82) return "\uD83C\uDF27\uFE0F"; // rain showers
  if (code <= 86) return "\u2744\uFE0F"; // snow showers
  if (code >= 95) return "\u26C8\uFE0F"; // thunderstorm
  return "\u2600\uFE0F";
}

// WMO code → human-readable condition
function wmoCondition(code: number): string {
  if (code === 0) return "Clear";
  if (code <= 3) return "Partly Cloudy";
  if (code <= 49) return "Fog";
  if (code <= 55) return "Drizzle";
  if (code <= 59) return "Freezing Drizzle";
  if (code <= 65) return "Rain";
  if (code <= 69) return "Freezing Rain";
  if (code <= 75) return "Snow";
  if (code <= 77) return "Snow Grains";
  if (code <= 82) return "Rain Showers";
  if (code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorm";
  return "Clear";
}

function dayLabel(date: Date, isToday: boolean): string {
  if (isToday) return "Today";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || process.env.WEATHER_LAT || "51.5074";
  const lon = searchParams.get("lon") || process.env.WEATHER_LON || "-0.1278";

  try {
    const weatherUrl =
      `${OPEN_METEO_BASE}?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code` +
      `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&wind_speed_unit=kmh&timezone=auto&forecast_days=5`;

    const geoUrl =
      `${NOMINATIM_BASE}?lat=${lat}&lon=${lon}&format=json&zoom=10`;

    const [res, geoRes] = await Promise.all([
      fetch(weatherUrl, { next: { revalidate: 1800 } }),
      fetch(geoUrl, {
        next: { revalidate: 86400 },
        headers: { "User-Agent": "HarmonicWavesDashboard/1.0" },
      }),
    ]);

    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);

    const data = await res.json();

    // Reverse geocode for location name
    let location = "";
    try {
      if (geoRes.ok) {
        const geo = await geoRes.json();
        const city = geo.address?.city || geo.address?.town || geo.address?.village || geo.address?.county || "";
        const country = geo.address?.country_code?.toUpperCase() || "";
        location = city && country ? `${city}, ${country}` : city || country;
      }
    } catch {
      // Location name is non-critical
    }

    // Parse current conditions
    const current = {
      icon: wmoEmoji(data.current.weather_code),
      temp: Math.round(data.current.temperature_2m),
      condition: wmoCondition(data.current.weather_code),
      humidity: Math.round(data.current.relative_humidity_2m),
      wind: Math.round(data.current.wind_speed_10m),
    };

    // Parse daily forecast (up to 4 days)
    const todayStr = new Date().toISOString().slice(0, 10);
    const forecast = data.daily.time.slice(0, 4).map((dateStr: string, i: number) => ({
      day: dayLabel(new Date(dateStr + "T12:00:00Z"), dateStr === todayStr),
      icon: wmoEmoji(data.daily.weather_code[i]),
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
    }));

    return NextResponse.json({ current, forecast, location });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json(
      { current: null, forecast: [], error: "Data temporarily unavailable" },
      { status: 200 }
    );
  }
}
