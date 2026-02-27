# Harmonic Waves Command Centre — Architecture & Setup

## Project Overview

A full-screen ambient wall dashboard for sound healing practitioners. Displays live Earth data (Schumann resonance, geomagnetic KP index, lunar phase, tidal intelligence, weather) on a horizontal monitor running 24/7. Built as a Next.js app deployed on Vercel.

**GitHub:** https://github.com/RemiDz/dashbaord
**Local path:** C:\Users\rdzingel\Documents\MY_APPS\HARMONIC_WAVES\dashbaord.app

## Design Reference

The prototype artifact (`harmonic-command-centre.jsx`) establishes the visual language:
- Dark celestial background (#0a0a14 → #0d0d1a)
- Brass/copper Tartarian aesthetic (rgba(205, 170, 110, x))
- Fonts: Cinzel (headings/labels), Cormorant Garamond (body/descriptions), JetBrains Mono (data values)
- Sacred geometry accents, zodiac symbols, ornate clock
- Subtle particle field that reacts to geomagnetic intensity
- CSS Grid layout, 5-column × 2-row, clock centred spanning both rows

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS custom properties for theme tokens
- **Deployment:** Vercel
- **Data fetching:** Server-side API routes as proxies, client-side SWR for polling
- **Canvas:** HTML5 Canvas for clock + sparklines (no heavy chart libs)
- **Animations:** CSS animations + requestAnimationFrame for canvas

## Project Structure

```
dashbaord.app/
├── public/
│   └── fonts/                    # Self-hosted Cinzel, Cormorant Garamond, JetBrains Mono
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout, font loading, meta
│   │   ├── page.tsx              # Single page — the dashboard
│   │   ├── globals.css           # Tailwind directives + theme tokens + animations
│   │   └── api/
│   │       ├── schumann/route.ts # Proxy to NOAA/GFZ data
│   │       ├── kp/route.ts       # KP index from NOAA SWPC
│   │       ├── lunar/route.ts    # Moon phase calculations (or API)
│   │       ├── tidal/route.ts    # UK Admiralty / NOAA tides
│   │       └── weather/route.ts  # OpenWeatherMap proxy
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── DashboardGrid.tsx       # Main grid layout orchestrator
│   │   │   ├── panels/
│   │   │   │   ├── SchumannPanel.tsx    # Schumann resonance + sparkline
│   │   │   │   ├── KpIndexPanel.tsx     # Geomagnetic KP + sparkline + alerts
│   │   │   │   ├── LunarPanel.tsx       # Moon phase SVG + sign + element
│   │   │   │   ├── TidalPanel.tsx       # Tidal curve + next high/low
│   │   │   │   ├── WeatherPanel.tsx     # Current + 4-day forecast
│   │   │   │   ├── ClockPanel.tsx       # Tartarian analog clock (canvas)
│   │   │   │   ├── BinaraPanel.tsx      # Recommended frequency card
│   │   │   │   ├── EarthEnergyPanel.tsx # Summary bars
│   │   │   │   └── InsightPanel.tsx     # AI-generated daily insight
│   │   │   └── AlertBadges.tsx          # Social media post-worthy indicators
│   │   ├── shared/
│   │   │   ├── Panel.tsx               # Reusable panel wrapper (glass, border, glow)
│   │   │   ├── Sparkline.tsx           # Canvas sparkline component
│   │   │   ├── ParticleField.tsx       # Background particle animation
│   │   │   └── MoonPhase.tsx           # Moon SVG component
│   │   └── clock/
│   │       └── TartarianClock.tsx      # Ornate canvas clock
│   ├── hooks/
│   │   ├── useSchumannData.ts          # SWR hook for Schumann
│   │   ├── useKpIndex.ts              # SWR hook for KP
│   │   ├── useLunarData.ts            # SWR hook for lunar
│   │   ├── useTidalData.ts            # SWR hook for tidal
│   │   ├── useWeather.ts              # SWR hook for weather
│   │   └── useTime.ts                 # Clock tick hook
│   ├── lib/
│   │   ├── theme.ts                   # Theme tokens exported as JS
│   │   ├── api-clients.ts             # External API fetch functions
│   │   ├── lunar-calc.ts              # Moon phase calculation (can be local)
│   │   └── binara-engine.ts           # Frequency recommendation logic
│   └── types/
│       └── dashboard.ts               # TypeScript interfaces for all data
├── tailwind.config.ts
├── next.config.js
├── package.json
├── tsconfig.json
├── .env.local.example                 # API keys template
└── CLAUDE.md                          # Claude Code project instructions
```

## Theme Tokens (CSS Custom Properties)

```css
:root {
  --bg-primary: #0a0a14;
  --bg-secondary: #0d0d1a;
  --bg-panel: rgba(15, 15, 25, 0.7);
  --border-brass: rgba(205, 170, 110, 0.12);
  --border-brass-strong: rgba(205, 170, 110, 0.3);
  --text-brass: rgba(205, 170, 110, 0.9);
  --text-brass-dim: rgba(205, 170, 110, 0.5);
  --text-brass-faint: rgba(205, 170, 110, 0.25);
  --text-value: rgba(230, 200, 140, 0.95);
  --accent-gold: rgba(220, 185, 120, 0.9);
  --accent-copper: rgba(230, 140, 80, 0.7);
  --status-calm: rgba(100, 200, 160, 0.9);
  --status-elevated: rgba(230, 130, 80, 0.95);
  --status-storm: rgba(230, 90, 60, 0.9);
  --tidal-blue: rgba(80, 180, 220, 0.9);
  --font-display: 'Cinzel', serif;
  --font-body: 'Cormorant Garamond', serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

## Data Refresh Intervals

| Data Source | Refresh Interval | Notes |
|---|---|---|
| Schumann Resonance | 5 minutes | GFZ Potsdam or heartmath.org |
| KP Index | 15 minutes | NOAA SWPC |
| Lunar Phase | 1 hour | Can calculate client-side |
| Tidal Data | 30 minutes | UK Admiralty API or NOAA |
| Weather | 30 minutes | OpenWeatherMap (free tier) |
| Clock | requestAnimationFrame | Continuous canvas render |
| Binara Recommendation | Derived | Recalculates when inputs change |
| Daily Insight | 1 hour | Based on combined conditions |

## Environment Variables

```
OPENWEATHER_API_KEY=xxx
NOAA_API_TOKEN=xxx         # Optional, some endpoints are public
ADMIRALTY_API_KEY=xxx       # For UK tidal data
```

## Key Design Rules

1. **No scrolling** — everything visible on one screen at all times
2. **16:9 horizontal layout** optimised for wall-mounted monitor
3. **Dark background only** — this runs 24/7, must be easy on the eyes
4. **Animations are data-driven** — particle intensity responds to KP, sparklines pulse on thresholds
5. **Panel component is the building block** — every data section uses the same Panel wrapper
6. **Grid is the layout engine** — panels are positioned by grid coordinates, making rearrangement trivial
7. **Data hooks are independent** — each panel fetches its own data via SWR, failures don't cascade

## Future Expansion Points

- Drag-and-drop panel reordering (react-grid-layout)
- Panel visibility config (show/hide panels)
- Multiple layout presets (compact, expanded, focus mode)
- Additional panels: solar flares, aurora probability, planetary hours
- PRO tier with customisable alerts and notification push
- sonarus.app integration (sound frequency analysis)
- overtonesinger.com integration (vocal overtone data)
