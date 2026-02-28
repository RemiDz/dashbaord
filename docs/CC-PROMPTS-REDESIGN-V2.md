# CC Prompts — Dashboard Redesign v2 (True Lunata Match)

Save 07-REDESIGN-V2-LUNATA-MATCH.md to your docs/ folder first.

---

## Prompt 1 — Study Lunata & Apply Background + Cards
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md in full first.

Then study the Lunata source code — it's in the same parent directory:
../lunata.app/

Read these files carefully:
- ../lunata.app/src/app/globals.css
- ../lunata.app/src/app/page.tsx  
- All files in ../lunata.app/src/components/

Understand how Lunata implements:
1. The deep space star field background
2. The glass morphism card style (transparency, blur, borders, shadows)
3. The colour palette and CSS variables

Now apply these to our dashboard:
- Replace our background with Lunata's exact star field technique and deep space gradient
- Replace our Panel/card component with Lunata's exact glass morphism style — copy the actual CSS values for backdrop-filter, borders, shadows, backgrounds
- Update our colour palette to match Lunata's cool celestial tones
- Keep our data components and API hooks untouched for now

The dashboard background and cards must be visually IDENTICAL to Lunata's style.
```

## Prompt 2 — New Layout + Clock Panel
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "New Layout" section.

Restructure the grid:
- 12-column grid, 2 rows
- Row 1: Clock (cols 1-4), Weather (cols 5-8), Lunar (cols 9-12)
- Row 2: KP+Schumann (cols 1-3), Space Weather (cols 4-6), Tidal (cols 7-9), Insight (cols 10-12)
- Top bar: slim 40px with "HARMONIC WAVES" left, alert badges centre, date right
- Gap 16px, padding 16px 20px

Move the Tartarian analog clock into its own full panel in Row 1 Left. 
Make the clock canvas large — it should fill most of the card. Keep its 
brass/gold aesthetic. Display digital time and date below it. This is 
the ONE warm-toned element on the dashboard.

Remove the old layout completely.
```

## Prompt 3 — Weather Panel (Information Rich)
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "WEATHER" section.

Rebuild the weather panel to be information-rich, not mostly empty:
- Current temp as hero number (50px+)
- Large weather condition icon (not tiny emoji)
- Location clearly visible
- Humidity, wind speed, pressure displayed clearly
- Sunrise & sunset times with sun icons
- 4-5 day forecast in a clear readable row — each day with name, icon, 
  high/low temps at MINIMUM 14px font size
- Today highlighted as active day
- Everything must be readable without zooming in

This panel should feel packed with useful weather data at a glance.
```

## Prompt 4 — Realistic Moon (Match Lunata Exactly)
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "LUNAR PHASE" section.

Study Lunata's moon rendering component:
- Find the moon component in ../lunata.app/src/components/
- Read exactly how it creates the realistic moon texture, craters, 
  terminator shadow, and ambient glow

Rebuild our moon to match Lunata's quality:
- Large moon (200px+ diameter) with realistic surface texture
- Visible crater/mare patches using layered gradients
- Soft terminator shadow with gradient edge (not a hard line)
- Outer atmospheric glow that breathes/pulses gently
- Star dots visible behind the moon within the panel

Arrange lunar data around the moon:
- Phase name in elegant serif font
- Illumination % (large)
- Zodiac sign with emoji
- Element
- Next full moon date  
- Void of Course time
- "Growing toward Full" or similar status text

This moon must look as good as Lunata's. Reference the actual source code.
```

## Prompt 5 — KP + Schumann Combined & Space Weather
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "KP INDEX & SCHUMANN" and 
"SPACE WEATHER ALERTS" sections.

1. Combine KP Index and Schumann Resonance into ONE card:
   - Top half: Schumann frequency (large number) + 24h sparkline with 
     7.83 Hz reference line
   - Bottom half: KP value (large, colour-coded) + status badge + 24h 
     sparkline with storm threshold
   - Subtle glass-style divider between them

2. Create the NEW Space Weather Alerts panel:
   - Create a new API route: /api/space-weather
   - Fetch from NOAA SWPC endpoints:
     - https://services.swpc.noaa.gov/products/alerts.json (active alerts)
     - https://services.swpc.noaa.gov/products/solar-wind/plasma-7-day.json 
       (solar wind data)
     - https://services.swpc.noaa.gov/products/solar-wind/mag-7-day.json 
       (Bz component)
   - Display: active alerts (colour-coded), solar wind speed, Bz 
     direction, geomagnetic storm probability
   - Create SWR hook: useSpaceWeather with 10min refresh
   - Handle errors gracefully — show "No active alerts" when calm
```

## Prompt 6 — Cinematic Tidal Panel
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "TIDAL INTELLIGENCE" section.

Study how Lunata handles animated visual effects — look for any wave, 
water, or animated components in ../lunata.app/src/components/.

Rebuild the tidal panel with cinematic water animation:
- Current tide height as large number
- Rising/Falling status with animated directional arrow
- Next high/low times clearly displayed
- Animated water surface at the bottom of the card:
  - Multiple translucent blue wave layers with offset animation
  - Water level that visually represents current tide height
  - Gentle continuous wave motion using CSS animations or canvas
  - Subtle foam/light sparkle on wave crests
  - The effect should feel like looking into a window at the ocean
- Tidal curve sparkline above the water animation
- Station name at bottom

The water animation is the signature element of this panel — make it 
beautiful and cinematic.
```

## Prompt 7 — Daily Insight Combined Panel + Polish
```
Read docs/07-REDESIGN-V2-LUNATA-MATCH.md "DAILY INSIGHT" and 
"Animation Requirements" sections.

1. Build the combined Insight panel:
   - Daily Insight text as hero: large italic Cormorant Garamond, 
     contextual practitioner guidance based on all current conditions
   - Binara Recommendation: compact glass card-within-card showing 
     frequency, wave type, description
   - Earth Energy Summary: compact bars at the bottom — geomagnetic, 
     solar wind, ionospheric, Schumann power

2. Add animations across the entire dashboard:
   - Stars: subtle twinkle
   - Moon: breathing glow
   - Clock: smooth second hand
   - Tidal water: continuous wave motion
   - Data values: smooth number transitions on update
   - Alert badges: gentle pulse
   - Cards: very subtle border brighten on hover

3. Verify the entire dashboard:
   - Run npm run build — zero errors
   - All 7 panels render with live data
   - Background matches Lunata's deep space feel
   - Cards match Lunata's glass morphism
   - Moon looks realistic with glow
   - Tidal water animation runs smoothly
   - Everything readable from 2-3 metres at 1920×1080
   - No scrollbars, no overflow
   - Runs smoothly for 10+ minutes without memory leaks

Commit and push:
git add .
git commit -m "v2: Lunata-matched cosmic observatory redesign"
git push origin main
```

---

## Troubleshooting

### If CC can't find Lunata files:
```
The Lunata source is at ../lunata.app/ relative to this project. 
List the directory: ls ../lunata.app/src/components/
Then read the key component files to understand the styling approach.
```

### If moon still doesn't match:
```
Read the exact moon component from ../lunata.app/src/components/ — find 
the file that renders the moon phase visual. Copy the rendering approach 
directly. The moon needs visible crater textures (dark patches), a soft 
shadow terminator, and an outer glow. If Lunata uses canvas, use canvas. 
If it uses layered divs with gradients, use that. Match the technique.
```

### If water animation is janky:
```
Simplify the tidal water animation. Use 3 layered SVG wave paths with 
CSS animation at different speeds and opacities. The bottom wave darkest 
(opacity 0.6), middle wave medium (0.4), top wave lightest (0.2). Each 
wave translates horizontally at different speeds. Use will-change: 
transform for GPU acceleration. This should run at 60fps easily.
```
