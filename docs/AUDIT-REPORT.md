# Dashboard.app — Full Audit Report

**Date:** 2026-03-05
**Build:** Next.js 16.1.6 (Turbopack) — ZERO errors, ZERO warnings

---

## CRITICAL — Data Accuracy Issues

### C1. Schumann Resonance is synthetic (by design, not a bug)
- **File:** `src/app/api/schumann/route.ts`
- **What it shows:** A physically-motivated synthetic signal derived from live NOAA Kp data
- **Why:** No public REST API provides structured Schumann resonance data
- **Status:** The code is clearly documented. The signal is tied to real geomagnetic conditions (Kp modulation, diurnal variation, deterministic seeded noise). This is an acceptable compromise. No fix needed unless a real data source becomes available.

### C2. Lunar phase accuracy: ~1.5 day drift over 26 years
- **File:** `src/lib/lunar-calc.ts`
- **What it shows:** Phase calculated from a constant synodic period (29.5306 days) anchored to a known new moon in Jan 2000
- **What's correct:** Over 26 years (~332 cycles), accumulated error is approximately 1.4 days. For March 5, 2026, the code reports ~22% illumination and "Waxing Crescent"; actual is ~35% illumination, still "Waxing Crescent"
- **Impact:** Phase name is correct. Illumination percentage may differ by ~10-15% from actual. Acceptable for an ambient dashboard display
- **Status:** No fix applied. The ecliptic longitude calculation (Meeus simplified, 6 perturbation terms) gives zodiac sign accuracy within ~2 degrees, which is sufficient

### C3. All live API endpoints verified active
- **KP Index:** `services.swpc.noaa.gov/products/noaa-planetary-k-index.json` — active, format correct (array of arrays, header row skipped, Kp at index 1)
- **Space Weather:** All 6 SWPC endpoints active (`alerts.json`, `solar-wind/plasma-7-day.json`, `solar-wind/mag-7-day.json`, `noaa-scales.json`, `summary/10cm-flux.json`, `summary/solar-flares-24-hour.json`)
- **Tidal:** NOAA Tides & Currents API active, format verified
- **Weather:** Open-Meteo free tier active, WMO codes correctly mapped
- **Air Quality:** Open-Meteo Air Quality API active, European AQI scale correct
- **Beach Cam:** SkylineWebcams snapshot URLs verified in code (may drift over time)

---

## HIGH — Bugs Affecting 24/7 Reliability

### H1. Beach cam Unsplash fallback is dead (FIXED)
- **File:** `src/app/api/beach-cam/image/route.ts:44-65`
- **Issue:** `source.unsplash.com` was deprecated and shut down in 2023. The fallback would always fail, falling through to a 1x1 transparent pixel
- **Fix:** Replaced dead Unsplash fetch with an inline SVG ocean gradient placeholder. No external dependency

### H2. StarField animation at uncapped FPS (FIXED)
- **File:** `src/components/shared/StarField.tsx`
- **Issue:** requestAnimationFrame loop drawing 1210 stars with twinkle every frame at 60-120fps. On a Raspberry Pi 5 running 24/7, this wastes CPU/GPU for a subtle background effect
- **Fix:** Added frame rate cap at 20fps. Background star twinkle is imperceptible at higher rates

### H3. TidalChart animation at uncapped FPS (FIXED)
- **File:** `src/components/dashboard/panels/TidalPanel.tsx:387-389`
- **Issue:** Water ripple animation runs at uncapped 60fps+ continuously. Full canvas redraw each frame
- **Fix:** Added 30fps cap. Water ripple animation remains smooth at 30fps

### H4. Sparkline pulse animation at uncapped FPS (FIXED)
- **File:** `src/components/shared/Sparkline.tsx:201-209`
- **Issue:** When `pulseEndpoint` is true, the entire sparkline is redrawn every frame at 60fps+ just for a pulsing dot
- **Fix:** Added 30fps cap. Pulse animation remains visually smooth

### H5. CalendarPanel has no midnight refresh (FIXED)
- **File:** `src/components/dashboard/panels/CalendarPanel.tsx`
- **Issue:** Calendar uses `new Date()` during render with `useMemo` keyed on `[year, month, date]`. No mechanism forces re-render at midnight. The calendar would show yesterday's highlight until another panel's SWR refresh triggers a re-render (up to 30 minutes delay)
- **Fix:** Added a `setTimeout` that schedules a state update at midnight, forcing the calendar to refresh immediately when the date changes. Timer auto-reschedules for subsequent nights.

---

## MEDIUM — Code Quality & Minor Data Issues

### M1. Weather "Today" timezone mismatch (FIXED)
- **File:** `src/app/api/weather/route.ts:116`
- **Issue:** Used `new Date().toISOString().slice(0, 10)` (UTC date) to determine which forecast day is "Today", but Open-Meteo returns dates in the user's timezone (via `timezone=auto`). Near midnight UTC, "Today" could be wrong for non-UTC timezones
- **Fix:** Now uses `data.daily.time[0]` (the first date from the API response) as "today", which respects the timezone

### M2. WMO weather codes 83-84 misclassified (FIXED)
- **File:** `src/app/api/weather/route.ts:19-23, 35-39`
- **Issue:** WMO codes 83-84 (mixed rain and snow showers) were mapped to "Snow Showers" and snowflake emoji. They should be sleet/mixed precipitation
- **Fix:** Added explicit handling for codes 83-84: "Sleet Showers" with cloud-snow emoji

### M3. KP Index threshold labels
- **File:** `src/hooks/useKpIndex.ts:26-27`
- **Status:** `isElevated` threshold at Kp >= 3 and `isStorm` at Kp >= 5 are correct per NOAA's official Kp scale (0-3 quiet, 3-4 unsettled, 5+ storm). No fix needed

### M4. console.error in API routes
- **Files:** All `src/app/api/*/route.ts` files
- **Status:** Server-side `console.error` calls in catch blocks are appropriate for Vercel production logging. No `console.log` calls exist in any source file. No fix needed

### M5. No `any` types found
- TypeScript strict mode is enabled. Grep found zero `any` type annotations in source files

---

## LOW — Notes for Future Reference

### L1. Orphaned/unused panel components
The following components exist but are not used in the current DashboardGrid:
- `EarthEnergyPanel.tsx` — superseded by KpSchumannPanel + GuidancePanel
- `GuidancePanel.tsx` — contains insight engine + binara recommendation (currently not in grid)
- `InsightPanel.tsx` — standalone insight display (superseded by GuidancePanel)
- `KpIndexPanel.tsx` — standalone KP display (superseded by KpSchumannPanel)
- `SchumannPanel.tsx` — standalone Schumann display (superseded by KpSchumannPanel)
- `SacredGeometry.tsx` — Flower of Life SVG overlay (not imported)
- `ParticleField.tsx` — KP-reactive particle animation (not imported)

These don't affect the build or bundle (tree-shaking removes them). Can be deleted for repository hygiene if desired.

### L2. Duplicated CSS: `.glass-card` and `.panel` in globals.css
Both classes have identical styles (lines 333-431). The `.panel` class is used; `.glass-card` is legacy. Could deduplicate with `@apply` or remove `.glass-card`.

### L3. Beach cam snapshot URLs may become stale
SkylineWebcams periodically changes their CDN URLs. The hardcoded URLs in `src/lib/beach-data.ts` may stop returning images. The proxy pattern handles this gracefully (falls back to SVG placeholder), but stale URLs waste fetch time.

### L4. Geolocation only requested once
`useGeolocation` calls `getCurrentPosition` once on mount. If permission is denied initially, it never retries. For a wall-mounted dashboard, this is fine — the location doesn't change. Falls back to env vars or defaults.

### L5. Solar flares endpoint format uncertainty
`summary/solar-flares-24-hour.json` response format is not well-documented by NOAA. The code tries multiple field names (`24hr_class`, `class`, raw string). Robust fallback handling is in place.

---

## Security Audit

- **No API keys in source code.** All secrets use `process.env` (`ADMIRALTY_API_KEY`, `WEATHER_LAT/LON`, `NOAA_TIDAL_STATION`, `TIDAL_PROVIDER`)
- **`.env*` is in `.gitignore`** (line 34: `.env*`)
- **No exposed sensitive data.** API routes proxy external APIs, hiding keys from the client
- **No XSS vectors.** All data is rendered via React (auto-escaped). No `dangerouslySetInnerHTML`
- **No SQL injection.** No database layer exists

---

## Performance Summary (24/7 RPi5 Operation)

| Animation | Before | After | Impact |
|-----------|--------|-------|--------|
| StarField (1210 stars) | ~60fps uncapped | 20fps capped | ~66% CPU reduction |
| TidalChart (water ripple) | ~60fps uncapped | 30fps capped | ~50% CPU reduction |
| Sparkline pulse | ~60fps uncapped | 30fps capped | ~50% CPU reduction |
| TartarianClock | ~60fps (rAF) | ~60fps (unchanged) | Smooth seconds hand needs 60fps |
| ParticleField | 60fps (capped) | 60fps (not in grid) | N/A — unused |

All SWR data fetches use appropriate intervals:
- Schumann: 5min
- KP Index: 15min
- Weather: 30min
- Air Quality: 30min
- Tidal: 30min
- Space Weather: 10min
- Beach Cam: 60s metadata, 60s image
- Lunar: 60min (client-side calc)

No memory leaks found: all `setInterval`, `setTimeout`, `requestAnimationFrame`, and `ResizeObserver` instances are cleaned up in `useEffect` return functions.

---

## Build Verification

```
next build — ZERO errors, ZERO TypeScript warnings
Compiled successfully in 3.4s
All 11 routes generated successfully
```
