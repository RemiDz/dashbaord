# Phase 3 — Live Data Integration

## Goal

Replace all mock data with real API sources. Each data feed goes through a Next.js API route (to hide keys and handle CORS), and panels consume data via SWR hooks with appropriate polling intervals.

## Data Source Research

Before implementing, verify each API endpoint is accessible and returns the expected format. Some endpoints may have changed — check the actual response shape.

### 3.1 — Schumann Resonance

**Primary:** GFZ Potsdam — https://www-app3.gfz-potsdam.de/kp_index/
**Alternative:** HeartMath Global Coherence — check for public API availability
**Fallback:** Space Weather Live — https://www.spaceweatherlive.com

Implementation:
- API route: `src/app/api/schumann/route.ts`
- Fetch latest Schumann resonance data
- Parse and normalise to `{ frequency: number, timestamp: string }[]`
- Cache response for 5 minutes (use Next.js `revalidate` or in-memory cache)
- SWR hook: `useSchumannData` — polls every 5 minutes
- Return last 48 data points (24h at 30min intervals)

If no reliable direct Schumann API exists, consider scraping or using the GFZ magnetogram data as a proxy.

### 3.2 — KP Index

**Primary:** NOAA SWPC
- Current KP: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json`
- Forecast: `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json`

Implementation:
- API route: `src/app/api/kp/route.ts`
- Fetch current + recent KP values
- Parse JSON array — each entry has `[timestamp, kp_value, ...]`
- SWR hook: `useKpIndex` — polls every 15 minutes
- Return current value + 24h history

### 3.3 — Lunar Data

**Approach:** Client-side calculation — no API needed.

Implementation:
- `src/lib/lunar-calc.ts` — implement or use a lightweight moon phase algorithm
- Calculate: phase (0-1), illumination (0-1), phase name, moon sign (zodiac), next full/new moon
- Consider using the algorithm from lunata.app if already implemented
- SWR hook: `useLunarData` — recalculates every hour (moon data changes slowly)

Key calculations:
- Moon phase from Julian date
- Zodiac sign from ecliptic longitude
- Void of Course times (complex — may need ephemeris data or simplify)

### 3.4 — Tidal Data

**Primary (UK):** Admiralty Tidal API — https://admiraltyapi.azure.io/
- Requires API key (free tier available)
- Endpoint: `/uktidalapi/api/V1/Stations/{stationId}/TidalEvents`

**Alternative:** NOAA Tides — https://api.tidesandcurrents.noaa.gov/api/prod/datagetter
- Free, no key needed
- Parameters: `station=xxxx&product=predictions&datum=MLLW&units=metric&time_zone=gmt&interval=hilo&format=json`

Implementation:
- API route: `src/app/api/tidal/route.ts`
- Fetch today's tidal predictions for configured station
- Parse into `{ time: string, height: number, type: 'high' | 'low' }[]`
- Also fetch hourly predictions for the sparkline curve
- SWR hook: `useTidalData` — polls every 30 minutes
- Config: station ID in env var or hardcoded for London/Thames

### 3.5 — Weather

**Primary:** OpenWeatherMap — https://api.openweathermap.org/data/2.5/
- Current: `/weather?lat={lat}&lon={lon}&units=metric&appid={key}`
- Forecast: `/forecast?lat={lat}&lon={lon}&units=metric&appid={key}`
- Free tier: 1000 calls/day

Implementation:
- API route: `src/app/api/weather/route.ts`
- Fetch current conditions + 5-day forecast
- Map OWM condition codes to our weather icons/emoji
- SWR hook: `useWeather` — polls every 30 minutes
- Default location: London (configurable via env vars)

## SWR Hook Pattern

All hooks follow the same pattern:

```tsx
// src/hooks/useKpIndex.ts
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useKpIndex() {
  const { data, error, isLoading } = useSWR('/api/kp', fetcher, {
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    revalidateOnFocus: false,         // Don't refetch on tab focus (always-on display)
    dedupingInterval: 60 * 1000,      // Dedupe requests within 1 min
  });

  return {
    current: data?.current ?? null,
    history: data?.history ?? [],
    isElevated: (data?.current ?? 0) >= 3,
    isLoading,
    error,
  };
}
```

## API Route Pattern

```tsx
// src/app/api/kp/route.ts
import { NextResponse } from 'next/server';

export const revalidate = 900; // Cache for 15 minutes

export async function GET() {
  try {
    const res = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json', {
      next: { revalidate: 900 },
    });

    if (!res.ok) throw new Error(`NOAA API error: ${res.status}`);

    const raw = await res.json();
    // Parse and transform...

    return NextResponse.json({ current, history });
  } catch (error) {
    console.error('KP fetch error:', error);
    // Return last known good data or graceful fallback
    return NextResponse.json(
      { current: null, history: [], error: 'Data temporarily unavailable' },
      { status: 200 } // Don't 500 — dashboard should still render
    );
  }
}
```

## Error Handling Strategy

Panels must NEVER break the dashboard:
- If API returns error → show last known data with "stale" indicator
- If no data ever loaded → show "--" placeholder values with "Connecting..." label
- If API route itself errors → return 200 with null data + error message
- SWR `onError` callback: log but don't throw
- Each panel independently handles its own loading/error states

## Environment Variables

Create `.env.local.example`:
```
# Weather
OPENWEATHER_API_KEY=your_key_here
WEATHER_LAT=51.5074
WEATHER_LON=-0.1278

# Tidal (if using Admiralty)
ADMIRALTY_API_KEY=your_key_here
TIDAL_STATION_ID=0113

# Optional overrides
SCHUMANN_SOURCE=gfz  # or heartmath
```

## Verify

- Each API route returns valid JSON when hit directly (`/api/schumann`, `/api/kp`, etc.)
- Dashboard displays live data with no errors in console
- Stale/error states render gracefully (no broken panels)
- Data refreshes automatically at specified intervals
- `npm run build` passes
- Test with network throttling — panels should show loading states then populate
