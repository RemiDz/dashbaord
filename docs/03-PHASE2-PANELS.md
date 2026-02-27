# Phase 2 — Panel Components (Mock Data)

## Goal

Build all panel components using mock/generated data. Each panel is self-contained and visually complete.

## Shared Components First

### 2.0a — Sparkline Component

`src/components/shared/Sparkline.tsx`

Canvas-based sparkline with props:
```tsx
interface SparklineProps {
  data: number[];
  color?: string;          // Line colour
  height?: number;         // Canvas height in px
  showArea?: boolean;      // Fill under line
  threshold?: number;      // Horizontal threshold line
  thresholdColor?: string; // Threshold line colour
}
```

Features:
- Smooth line through data points
- Gradient area fill under line
- Optional dashed threshold line
- Glowing dot on the latest data point
- Handles resize via ResizeObserver
- Retina-ready (2x canvas resolution)

### 2.0b — Moon Phase SVG

`src/components/shared/MoonPhase.tsx`

Props: `illumination` (0-1), `phase` (0-1 where 0=new, 0.5=full)
- SVG circle with terminator arc
- Subtle radial glow around moon
- Warm white illuminated portion

## Panel Components

Build each panel in `src/components/dashboard/panels/`. All panels use the shared `<Panel>` wrapper.

### 2.1 — SchumannPanel

Displays:
- Current Schumann frequency (large value + Hz unit)
- "Base frequency · 7.83 Hz nominal" subtitle
- 24h sparkline with 7.83 Hz threshold line
- "24h trend · 30min intervals" footer
- Breathing animation on the value when near resonance

Mock data: Generate 48 points (30min intervals) oscillating around 7.83 Hz with ±2 Hz variation.

### 2.2 — KpIndexPanel

Displays:
- Current KP value (large, colour-coded: green if <3, orange if ≥3)
- Status badge: "QUIET" (green) or "ELEVATED" (orange) or "STORM" (red if ≥5)
- Descriptive subtitle based on status
- 24h sparkline with Kp 4 storm threshold
- Footer with history label

Mock data: Generate 24 hourly points between 0.5 and 4.5.

### 2.3 — ClockPanel (spans 2 rows)

Contains:
- Tartarian analog clock (canvas) — see clock spec below
- Digital time display below clock (HH:MM:SS, JetBrains Mono)
- Timezone label
- Sacred divider
- Binara recommended frequency card

**Tartarian Clock Canvas Spec:**
- Outer brass ring (3px) with inner ring (1px)
- 12 hour markers (thicker at 12, 3, 6, 9)
- 60 minute tick marks (thin)
- Roman numerals (Cinzel font) on inner track
- Zodiac symbol ring (faint, inner)
- Hour hand: ornate with diamond accent, brass fill
- Minute hand: slender, brass
- Second hand: thin copper, with counterweight
- Centre: brass pin with radial gradient
- Smooth animation via requestAnimationFrame
- Clean up on unmount

### 2.4 — BinaraPanel (inside ClockPanel)

Small card below the clock:
- "BINARA · RECOMMENDED" label
- Frequency value (e.g. "10 Hz Alpha") in the recommendation colour
- Description (e.g. "Morning awakening flow")
- Border tinted with recommendation colour

Logic in `src/lib/binara-engine.ts`:
```
00-06: 2 Hz Delta — Deep restorative sleep
06-10: 10 Hz Alpha — Morning awakening flow
10-14: 14 Hz Beta — Focused clarity
14-18: 7.83 Hz Theta — Earth resonance alignment
18-21: 6 Hz Theta — Evening wind-down
21-00: 3 Hz Delta — Transition to sleep
```

Future: Factor in KP index, moon phase, Schumann deviation for smarter recommendations.

### 2.5 — LunarPanel

Displays:
- Moon phase SVG + phase name (e.g. "Waxing Gibbous")
- Illumination percentage
- Sacred divider
- 2×2 info grid:
  - Sign (e.g. "♌ Leo")
  - Element (e.g. "🔥 Fire")
  - Next full/new moon date
  - Void of Course time

Mock data: Hardcode realistic lunar data for today.

### 2.6 — WeatherPanel

Displays:
- Current: weather emoji + temperature (°C, large) + condition text
- Humidity + wind speed (small, right-aligned)
- Sacred divider
- 4-day forecast row: day label, emoji, high/low temps
- Today highlighted slightly brighter

Mock data: Hardcode realistic UK weather.

### 2.7 — TidalPanel (spans 2 columns)

Displays:
- Current tide height (large, tidal blue) + unit
- Status badge: "RISING" or "FALLING"
- Right side: 2×2 grid of next high/low times and heights
- Full-width 24h tidal curve sparkline (sinusoidal)
- Location label (e.g. "Thames Estuary")

Mock data: Generate 48 points as a sine wave (two tidal cycles).

### 2.8 — EarthEnergyPanel

Summary view with horizontal progress bars:
- Geomagnetic: derived from KP
- Solar Wind: mock value (km/s)
- Ionospheric: mock status
- Schumann Power: derived from Schumann deviation

Each bar has:
- Label (left) + value (right, coloured)
- Thin progress bar with gradient fill

### 2.9 — InsightPanel

Displays:
- Italicised practitioner guidance text (Cormorant Garamond)
- Generated based on current conditions (moon sign, KP status, time of day)
- Sacred divider
- "Generated from live conditions" footer

For now: hardcode 3-4 insight templates and select based on simple conditions.

### 2.10 — AlertBadges

`src/components/dashboard/AlertBadges.tsx`

Positioned in the top bar. Renders badges when:
- KP ≥ 3 → "KP Spike — Post worthy"
- Moon illumination > 0.95 → "Full Moon — Post worthy"
- Moon illumination < 0.05 → "New Moon — Post worthy"
- Schumann deviation > 1.5 Hz → "Schumann Spike — Post worthy"

Each badge has pulse animation and colour-coded background.

## Verify

- All panels render with mock data
- No overflow, no scrollbars at 1920×1080
- Clock animates smoothly
- Sparklines render correctly with threshold lines
- Alert badges pulse when conditions are met
- `npm run build` passes
