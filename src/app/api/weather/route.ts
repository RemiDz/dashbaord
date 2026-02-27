import { NextResponse } from "next/server";

const OWM_BASE = "https://api.openweathermap.org/data/2.5";

// Condition code → emoji mapping
// https://openweathermap.org/weather-conditions
function conditionEmoji(id: number): string {
  if (id >= 200 && id < 300) return "\u26C8\uFE0F"; // thunderstorm
  if (id >= 300 && id < 400) return "\uD83C\uDF26\uFE0F"; // drizzle
  if (id >= 500 && id < 600) return "\uD83C\uDF27\uFE0F"; // rain
  if (id >= 600 && id < 700) return "\u2744\uFE0F"; // snow
  if (id >= 700 && id < 800) return "\uD83C\uDF2B\uFE0F"; // mist/fog
  if (id === 800) return "\u2600\uFE0F"; // clear
  if (id === 801) return "\uD83C\uDF24\uFE0F"; // few clouds
  if (id === 802) return "\u26C5"; // scattered clouds
  if (id >= 803) return "\u2601\uFE0F"; // overcast
  return "\u2600\uFE0F";
}

// Get day abbreviation from Date
function dayLabel(date: Date, isToday: boolean): string {
  if (isToday) return "Today";
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

export async function GET() {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  const lat = process.env.WEATHER_LAT || "51.5074";
  const lon = process.env.WEATHER_LON || "-0.1278";

  if (!apiKey) {
    console.error("Weather: OPENWEATHER_API_KEY not set");
    return NextResponse.json(
      { current: null, forecast: [], error: "API key not configured" },
      { status: 200 }
    );
  }

  try {
    // Fetch current + 5-day forecast in parallel
    const [currentRes, forecastRes] = await Promise.all([
      fetch(
        `${OWM_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        { next: { revalidate: 1800 } }
      ),
      fetch(
        `${OWM_BASE}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
        { next: { revalidate: 1800 } }
      ),
    ]);

    if (!currentRes.ok) throw new Error(`OWM current error: ${currentRes.status}`);
    if (!forecastRes.ok) throw new Error(`OWM forecast error: ${forecastRes.status}`);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();

    // Parse current conditions
    const current = {
      icon: conditionEmoji(currentData.weather[0].id),
      temp: Math.round(currentData.main.temp),
      condition: currentData.weather[0].main as string,
      humidity: currentData.main.humidity as number,
      wind: Math.round(currentData.wind.speed * 3.6), // m/s → km/h
    };

    // Parse 5-day forecast into daily high/low
    // OWM returns 3-hour intervals; group by day and find min/max
    const dailyMap = new Map<string, { highs: number[]; lows: number[]; icon: number }>();
    const todayStr = new Date().toISOString().slice(0, 10);

    for (const entry of forecastData.list) {
      const dateStr = entry.dt_txt.slice(0, 10);
      if (!dailyMap.has(dateStr)) {
        dailyMap.set(dateStr, {
          highs: [],
          lows: [],
          icon: entry.weather[0].id,
        });
      }
      const day = dailyMap.get(dateStr)!;
      day.highs.push(entry.main.temp_max);
      day.lows.push(entry.main.temp_min);
      // Use midday icon as representative
      if (entry.dt_txt.includes("12:00:00")) {
        day.icon = entry.weather[0].id;
      }
    }

    const forecast: ForecastDay[] = [];
    let count = 0;
    for (const [dateStr, day] of dailyMap) {
      if (count >= 4) break;
      const date = new Date(dateStr + "T12:00:00Z");
      forecast.push({
        day: dayLabel(date, dateStr === todayStr),
        icon: conditionEmoji(day.icon),
        high: Math.round(Math.max(...day.highs)),
        low: Math.round(Math.min(...day.lows)),
      });
      count++;
    }

    return NextResponse.json({ current, forecast });
  } catch (error) {
    console.error("Weather fetch error:", error);
    return NextResponse.json(
      { current: null, forecast: [], error: "Data temporarily unavailable" },
      { status: 200 }
    );
  }
}
