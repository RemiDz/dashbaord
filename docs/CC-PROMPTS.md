# Claude Code Prompts — Harmonic Waves Command Centre

Use these prompts in order. Wait for each to complete before moving to the next.
After each prompt, verify the result visually in the browser before proceeding.

---

## PHASE 1 — Foundation

### Prompt 1.1 — Scaffold & Theme
```
Read docs/02-PHASE1-FOUNDATION.md and implement steps 1.1 through 1.3. 
Scaffold the Next.js project with TypeScript and Tailwind. Set up 
self-hosted fonts (Cinzel, Cormorant Garamond, JetBrains Mono). Create 
the full theme system in globals.css with all CSS custom properties and 
keyframe animations. Extend tailwind.config.ts with custom colours and 
font families.
```

### Prompt 1.2 — Panel Component & Grid Layout
```
Read docs/02-PHASE1-FOUNDATION.md and implement steps 1.4 through 1.7. 
Build the shared Panel wrapper component with glass morphism, brass 
borders, and glow animation. Create the DashboardGrid with the 5-column 
× 2-row CSS Grid layout. Build the ParticleField background canvas. 
Set up the root page with the date bar, alert badges area, and 
"Harmonic Waves" branding. Each grid cell should render a Panel with 
placeholder text showing which panel goes where.
```

### Prompt 1.3 — Verify Foundation
```
Run npm run build and fix any errors. Then run npm run dev and confirm:
- Full-screen dark grid with brass-bordered panels visible
- Particle field animating in background
- Date displayed top-left in British English format
- No scrollbars at any viewport size
- Glass effect and subtle glow on panels
Fix anything that doesn't match the spec.
```

---

## PHASE 2 — Panel Components (Mock Data)

### Prompt 2.1 — Shared Components
```
Read docs/03-PHASE2-PANELS.md sections 2.0a and 2.0b. Build the shared 
Sparkline canvas component with area fill, threshold line, and glowing 
endpoint dot. Build the MoonPhase SVG component. Both should be in 
src/components/shared/. The Sparkline must handle resize via 
ResizeObserver and render at retina resolution.
```

### Prompt 2.2 — Schumann & KP Panels
```
Read docs/03-PHASE2-PANELS.md sections 2.1 and 2.2. Build SchumannPanel 
showing current frequency, subtitle, 24h sparkline with 7.83 Hz threshold 
line, and footer. Build KpIndexPanel with colour-coded current value, 
status badge, sparkline with Kp 4 threshold, and footer. Use generated 
mock data — 48 points for Schumann oscillating around 7.83 Hz, 24 points 
for KP between 0.5 and 4.5. Both panels must use the shared Panel wrapper 
and Sparkline component.
```

### Prompt 2.3 — Tartarian Clock & Binara Card
```
Read docs/03-PHASE2-PANELS.md sections 2.3 and 2.4. Build the ClockPanel 
spanning both grid rows. The Tartarian clock is the centrepiece of the 
entire dashboard — it must be visually stunning. Canvas-rendered with:
brass outer ring, Roman numerals in Cinzel font, zodiac symbol ring, 
ornate hour hand with diamond accent, slender minute hand, thin copper 
second hand with counterweight, and brass centre pin. Below the clock: 
digital time display, timezone label, sacred divider, and the Binara 
recommended frequency card that changes based on time of day. Create 
src/lib/binara-engine.ts for the recommendation logic. Use 
requestAnimationFrame with proper cleanup.
```

### Prompt 2.4 — Lunar & Weather Panels
```
Read docs/03-PHASE2-PANELS.md sections 2.5 and 2.6. Build LunarPanel 
with the MoonPhase SVG, phase name, illumination percentage, and 2×2 
info grid showing sign, element, next full moon, and void of course. 
Build WeatherPanel with current temperature, condition, humidity, wind, 
and 4-day forecast row. Use hardcoded realistic mock data for both. 
British English, temperatures in °C.
```

### Prompt 2.5 — Tidal, Energy & Insight Panels
```
Read docs/03-PHASE2-PANELS.md sections 2.7, 2.8, and 2.9. Build 
TidalPanel spanning 2 columns with current tide height, rising/falling 
badge, next high/low times grid, and full-width tidal sparkline. Build 
EarthEnergyPanel with 4 horizontal progress bars (geomagnetic, solar 
wind, ionospheric, Schumann power). Build InsightPanel with italicised 
practitioner guidance text. Use mock data for all three.
```

### Prompt 2.6 — Alert Badges & Integration
```
Read docs/03-PHASE2-PANELS.md section 2.10. Build AlertBadges component 
that shows pulsing "Post worthy" badges when KP ≥ 3, full/new moon, or 
Schumann spike conditions are met. Integrate all panels into the 
DashboardGrid — remove placeholder text and render actual panel 
components in their correct grid positions. Verify everything fits 
on screen with no scrollbars.
```

### Prompt 2.7 — Verify Panels
```
Run npm run build and fix any errors. Then run npm run dev and verify:
- All 9 panels render correctly with mock data
- Clock animates smoothly with all decorative elements visible
- Sparklines show data with threshold lines
- Alert badges pulse in the top bar
- Moon phase SVG renders correctly
- No overflow or scrollbars at 1920×1080
- Overall aesthetic matches a dark celestial Tartarian theme
Fix anything that looks off or doesn't match the design spec.
```

---

## PHASE 3 — Live Data

### Prompt 3.1 — API Routes
```
Read docs/04-PHASE3-LIVE-DATA.md. Create all API routes in src/app/api/:
- /api/kp — fetch from NOAA SWPC planetary K index endpoint
- /api/schumann — fetch Schumann resonance data (research the best 
  available public source first)
- /api/weather — proxy to OpenWeatherMap (use env var for API key, 
  default lat/lon to London)
- /api/tidal — fetch tidal data (use NOAA tides API as it's free 
  and keyless, pick a UK-relevant station or Thames if available)

Each route must have try/catch with graceful fallback — never return 
500 errors. Create .env.local.example documenting required variables.
```

### Prompt 3.2 — SWR Hooks
```
Read docs/04-PHASE3-LIVE-DATA.md SWR hook pattern section. Create all 
data hooks in src/hooks/:
- useSchumannData (5 min refresh)
- useKpIndex (15 min refresh)
- useLunarData (1 hour refresh, client-side calculation)
- useTidalData (30 min refresh)
- useWeather (30 min refresh)

All hooks must set revalidateOnFocus: false (this is an always-on 
display). Each hook returns typed data, loading state, and error state. 
Create src/lib/lunar-calc.ts for client-side moon calculations.
```

### Prompt 3.3 — Connect Panels to Live Data
```
Update all panel components to use the SWR hooks instead of mock data. 
Each panel must handle three states gracefully:
1. Loading — show subtle "Connecting..." text, no layout shift
2. Live data — render normally
3. Error — show last known values or "--" placeholders, never break

Update AlertBadges to derive conditions from live data hooks. Update 
the Binara recommendation to factor in actual KP and Schumann values 
when available. Update InsightPanel to generate text from real conditions.
```

### Prompt 3.4 — Verify Live Data
```
Run npm run build and fix any errors. Test each API route individually 
by visiting /api/kp, /api/schumann, /api/weather, /api/tidal in the 
browser — confirm they return valid JSON. Run npm run dev and verify:
- Dashboard populates with real data (or graceful fallbacks)
- Data refreshes automatically without page reload
- No console errors
- Panels handle API failures without breaking
Fix any issues.
```

---

## PHASE 4 — Polish & Deploy

### Prompt 4.1 — Data-Driven Animations
```
Read docs/05-PHASE4-POLISH.md sections 4.1 and 4.2. Add data-driven 
animations:
- ParticleField intensity responds to KP index (more particles when 
  KP ≥ 3, even more at ≥ 5)
- Sparkline endpoint dots glow/pulse when values exceed thresholds
- Panel borders glow brighter when their data is in alert state
- Alert badges slide in/out smoothly when conditions change
Keep animations subtle and performant — this runs 24/7.
```

### Prompt 4.2 — Insight Engine & Responsive
```
Read docs/05-PHASE4-POLISH.md sections 4.3 and 4.4. Expand the insight 
generation in src/lib/insight-engine.ts with at least 8-10 template 
combinations based on KP level, moon phase, moon sign/element, time of 
day, and tidal state. Reference specific sound healing instruments and 
techniques. Also add responsive refinements using CSS clamp() for font 
sizes. Ensure canvas components check devicePixelRatio for retina 
rendering. Test at 1920×1080, 2560×1440, and 3840×2160 viewports.
```

### Prompt 4.3 — Sacred Geometry & Meta
```
Read docs/05-PHASE4-POLISH.md sections 4.6 and 4.7. Add ONE subtle 
sacred geometry background element — either a Flower of Life pattern 
or concentric circles emanating from the clock — at very low opacity 
(2-3%), behind the panels. Create a favicon (brass circle with inner 
geometry). Set page title to "Harmonic Waves — Command Centre", add 
theme-color meta, and set noindex. Keep the sacred geometry barely 
perceptible — it should add depth, not distraction.
```

### Prompt 4.4 — Performance & Final Verification
```
Read docs/05-PHASE4-POLISH.md section 4.5 and the deployment checklist 
in 4.8. Optimise performance:
- Wrap panels in React.memo where appropriate
- Ensure no duplicate SWR fetches
- Cap particle animation at 60fps
- Add font-display: swap to all font declarations
- Remove any console.log statements (keep console.error for real errors)

Run npm run build — must pass with zero errors AND zero warnings. Run 
npm run dev and let it run for 10 minutes — confirm no memory leaks, 
clock stays smooth, and data refreshes correctly. Verify .env.local is 
in .gitignore. Confirm the dashboard is ready for Vercel deployment.
```

---

## DEPLOYMENT

After Phase 4 is complete, deploy from your terminal:

```bash
cd C:\Users\rdzingel\Documents\MY_APPS\HARMONIC_WAVES\dashbaord.app
git add .
git commit -m "Harmonic Waves Command Centre v1.0"
git push origin main
```

Then in Vercel:
1. Import the GitHub repo (RemiDz/dashbaord)
2. Set environment variables (OPENWEATHER_API_KEY etc.)
3. Deploy

---

## TROUBLESHOOTING PROMPTS

If something breaks, use these:

```
The [panel name] panel is overflowing the grid. Fix the layout so 
everything fits at 1920×1080 with no scrollbars.
```

```
The clock canvas is blurry on my monitor. Ensure it renders at the 
correct devicePixelRatio.
```

```
The /api/kp route is returning errors. Debug the NOAA SWPC endpoint, 
check if the URL or response format has changed, and fix the parser.
```

```
The dashboard is getting slow after running for a while. Check for 
memory leaks in canvas animations, SWR cache growth, and particle 
field performance. Fix any issues.
```
