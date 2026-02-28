# Dashboard Redesign v2 — True Lunata Style

## CRITICAL: Reference Lunata Source Code Directly

The Lunata app source is in the same parent folder:
`C:\Users\rdzingel\Documents\MY_APPS\HARMONIC_WAVES\lunata.app`

**Before writing ANY code, read these Lunata files:**
- `lunata.app/src/app/globals.css` — the theme, background, star field, glass card styles
- `lunata.app/src/app/page.tsx` — overall layout and structure
- `lunata.app/src/components/` — study the card components, moon rendering, animations
- Look for any star field / particle / background components
- Look for the moon phase rendering component — study exactly how it creates the realistic moon with craters, glow, and terminator

**Copy the actual CSS patterns, colour values, backdrop-filter settings, and animation approaches from Lunata. Do not approximate — use the real values.**

---

## What's Wrong Now

1. Background is flat dark — needs Lunata's deep space with real stars
2. Cards look like bordered boxes — need Lunata's glass morphism with transparency and depth
3. Moon is a basic circle — needs to match Lunata's realistic crater-textured moon with glow
4. Layout wastes massive space with panels that are 80% empty
5. Typography too small despite scaling — weather forecast is unreadable
6. No cinematic feel — everything is static and lifeless
7. Information density is too low — cards have huge empty areas

---

## New Layout — 2 Rows, Logical Grouping

### Row 1: Three cards (time, weather, moon)
```
┌──────────────────┬────────────────────────┬──────────────────────┐
│                  │                        │                      │
│   ANALOG CLOCK   │      WEATHER           │    LUNAR PHASE       │
│   (Tartarian,    │  (rich, detailed,      │  (hero moon like     │
│    large,        │   readable forecast,   │   lunata.app,        │
│    centred)      │   sunrise/sunset,      │   animated, with     │
│                  │   humidity, wind)       │   all lunar data)    │
│                  │                        │                      │
└──────────────────┴────────────────────────┴──────────────────────┘
```

### Row 2: Four cards (earth data, space weather, tides, insights)
```
┌──────────────┬───────────────┬───────────────┬──────────────────┐
│              │               │               │                  │
│  KP INDEX &  │ SPACE WEATHER │    TIDAL      │  DAILY INSIGHT   │
│  SCHUMANN    │  ALERTS &     │ INTELLIGENCE  │  + Binara rec    │
│  (combined,  │  DATA         │ (cinematic    │  + Earth energy  │
│   2 charts)  │               │  water rise)  │                  │
│              │               │               │                  │
└──────────────┴───────────────┴───────────────┴──────────────────┘
```

### Grid CSS
```css
/* Row 1: 3 columns */
grid-template-columns: 1fr 1.3fr 1.2fr;  /* weather gets more space */

/* Row 2: 4 columns */
/* Use a 12-col sub-grid or nested grid for row 2 */
/* KP+Schumann: 3/12, Space Weather: 3/12, Tidal: 3/12, Insight: 3/12 */
```

Alternative approach — single grid:
```css
display: grid;
grid-template-columns: repeat(12, 1fr);
grid-template-rows: 1fr 1fr;
gap: 16px;
padding: 16px 20px;

/* Row 1 */
.clock-panel     { grid-column: 1 / 5;   grid-row: 1; }  /* 4 cols */
.weather-panel   { grid-column: 5 / 9;   grid-row: 1; }  /* 4 cols */
.lunar-panel     { grid-column: 9 / 13;  grid-row: 1; }  /* 4 cols */

/* Row 2 */
.kp-schumann     { grid-column: 1 / 4;   grid-row: 2; }  /* 3 cols */
.space-weather   { grid-column: 4 / 7;   grid-row: 2; }  /* 3 cols */
.tidal-panel     { grid-column: 7 / 10;  grid-row: 2; }  /* 3 cols */
.insight-panel   { grid-column: 10 / 13; grid-row: 2; }  /* 3 cols */
```

### Top Bar (slim)
- Left: "HARMONIC WAVES" branding
- Centre: Alert badges (social media post-worthy indicators)
- Right: Date in British English format
- Height: ~40px, minimal, transparent

---

## Background — Copy from Lunata

Study `lunata.app/src/` for how the star field background is implemented. Copy the approach exactly:
- Deep space gradient base
- Star canvas/CSS with varying star sizes and opacities
- Subtle twinkle animation on select stars
- Any nebula or cosmic colour overlays

The background must be IDENTICAL in feel to Lunata — not "inspired by" but the same technique and quality.

---

## Card Style — Copy from Lunata

Study Lunata's card/glass components. The cards in Lunata have:
- True glass transparency — you can see the stars through the cards
- Soft borders that catch light
- Generous backdrop-filter blur
- Inner glow / luminosity
- Rounded corners
- No heavy borders or outlines

Copy the exact CSS from Lunata's card components. Every card in the dashboard must match this style.

---

## Panel Specs

### 1. ANALOG CLOCK (Row 1, Left)

The Tartarian clock gets its own full panel — large and proud.
- Canvas rendered, filling most of the card
- Keep the brass/gold ornamental aesthetic — this is the ONE warm element
- Roman numerals, zodiac ring, ornate hands
- Smooth second hand via requestAnimationFrame
- Digital time displayed below: large, readable
- Date below that (or move date to top bar only)
- The clock should feel like a beautiful antique instrument floating in space

### 2. WEATHER (Row 1, Centre)

This card needs to be INFORMATION RICH, not mostly empty:
- Current temperature: LARGE (50px+), hero element
- Current condition icon: large, not tiny emoji — consider animated weather icons or larger styled icons
- Location name clearly visible
- Humidity, wind speed, pressure — displayed clearly, not tiny
- Sunrise & sunset times with icons
- Forecast: 4-5 days displayed in a clear row
  - Each day: name, icon, high temp, low temp
  - ALL readable without zooming — minimum 14px for forecast temps
  - Today highlighted/active
- Consider a subtle temperature trend sparkline across the forecast days

### 3. LUNAR PHASE (Row 1, Right) — THE SHOWPIECE

**This must match Lunata's moon quality.** Study the Lunata moon component source code.

Lunata's moon features (from the screenshot):
- Massive realistic moon with visible crater textures (dark mare patches)
- Soft terminator shadow with gradient edge
- Outer atmospheric glow that breathes
- Star dots visible around/behind the moon
- Data overlaid elegantly: illumination %, zodiac sign with icon, phase name
- "Growing toward Full" status text

For the dashboard, include:
- Realistic moon at generous size (200px+ diameter)
- Phase name (Waxing Gibbous, etc.) in elegant serif
- Illumination percentage — large
- Zodiac sign with emoji/icon
- Element (Water, Fire, etc.)
- Next full moon date
- Void of Course time
- Moon rise/set times if available
- Breathing glow animation on the moon

### 4. KP INDEX & SCHUMANN RESONANCE (Row 2, First)

Combined card with two data streams:
- **Top half — Schumann:**
  - Label: "SCHUMANN RESONANCE"
  - Current frequency: large number + Hz
  - Sparkline chart showing 24h trend
  - 7.83 Hz reference line on chart
  
- **Bottom half — KP Index:**
  - Label: "KP INDEX"
  - Current KP value: large, colour-coded (green/orange/red)
  - Status badge (QUIET / ELEVATED / STORM)
  - Sparkline chart showing 24h trend
  - Storm threshold line on chart

- Divider between them: subtle glass-style separator, not a hard line

### 5. SPACE WEATHER ALERTS (Row 2, Second) — NEW PANEL

This is a NEW panel replacing the old Earth Energy bars. It should display:
- **Active alerts section:**
  - Any current NOAA space weather watches/warnings/alerts
  - Colour-coded by severity (green/yellow/orange/red)
  - If no active alerts: "No active alerts" with a calm indicator
  
- **Space weather data:**
  - Solar wind speed (km/s) with trend arrow
  - Bz component (north/south) — important for geomagnetic impact
  - Solar flux index (SFI)
  - Proton density
  - Geomagnetic storm probability (next 24h)

- Data source: NOAA SWPC — these endpoints are freely available:
  - `https://services.swpc.noaa.gov/products/alerts.json`
  - `https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json`
  - `https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json`
  - `https://services.swpc.noaa.gov/products/noaa-scales.json`

### 6. TIDAL INTELLIGENCE (Row 2, Third)

Must have cinematic water feel — study how Lunata handles animated water/wave effects:
- Current tide height: large number
- Rising/Falling status with animated direction arrow
- Next high/low times clearly displayed
- **Cinematic wave animation:** 
  - Animated water surface that rises and falls
  - Think: a glass container with water level that moves
  - Or: an animated wave pattern at the bottom of the card that responds to tidal state
  - The water should have depth — layers of translucent blue with wave motion
  - Subtle foam/sparkle on the wave crests
- Tidal curve sparkline showing the full 24h cycle
- Station/location name

### 7. DAILY INSIGHT + BINARA + EARTH ENERGY (Row 2, Fourth)

Combined practitioner guidance panel:
- **Daily Insight (top, hero):**
  - Italic Cormorant Garamond text, generous size
  - Contextual guidance based on all current conditions
  - This is what the practitioner reads first thing

- **Binara Recommendation (middle):**
  - Compact card-within-card
  - Recommended frequency + wave type (Alpha, Delta, etc.)
  - Brief description
  
- **Earth Energy Summary (bottom):**
  - Compact horizontal bars or indicators
  - Geomagnetic, Solar Wind, Ionospheric, Schumann Power
  - Minimal space, maximum clarity

---

## Animation Requirements

Everything should feel ALIVE but not distracting:
- Stars: subtle twinkle (copy from Lunata)
- Moon: breathing glow, gentle luminosity pulse
- Clock: smooth second hand (requestAnimationFrame)
- Tidal water: continuous gentle wave motion
- Sparklines: smooth transitions when data updates
- Cards: very subtle hover brighten (for when you walk up to the monitor)
- Data values: smooth number transitions on update (not instant swap)
- Alert badges: gentle pulse when active

---

## Implementation Order

1. **Background first** — copy Lunata's star field and deep space exactly
2. **Card style** — copy Lunata's glass morphism exactly
3. **Layout** — implement the new 12-column grid
4. **Clock panel** — move clock to its own card, make it large
5. **Weather panel** — rebuild with full information density
6. **Moon panel** — reference Lunata's moon component, match its quality
7. **KP + Schumann combined** — merge into one card with two charts
8. **Space Weather** — new panel with NOAA alerts data
9. **Tidal** — add cinematic water animation
10. **Insight + Binara + Energy** — combine into one card
11. **Top bar** — slim with branding, alerts, date
12. **Polish** — animations, transitions, verify

---

## Quality Bar

The finished dashboard should look like it belongs in the same product family as lunata.app. If you put a screenshot of the dashboard next to a screenshot of Lunata, they should feel like siblings — same deep space atmosphere, same glass card quality, same level of visual polish.

This is not a data dashboard with a dark theme. This is a cosmic observatory that happens to display data.
