# Dashboard Redesign — Lunata-Inspired Immersive Style

## The Problem

The current dashboard looks like data cards on a flat dark background. Panels are small, text is hard to read from a wall monitor, and there's too much dead space with no atmosphere. It needs to feel like Lunata — immersive deep-space, like floating in the cosmos.

## Design Philosophy

**From:** Flat panels on dark background → rigid, clinical, lifeless
**To:** Immersive cosmic observatory → you're floating in space, data orbits around you

Key principles from Lunata:
- Deep space atmosphere with layered depth (stars, nebula, subtle gradients)
- Glass morphism cards with generous blur and inner light
- Large confident typography readable from 3+ metres away
- Realistic celestial rendering (moon glow, Earth pulse, light effects)
- Breathing, living feel — subtle motion everywhere
- Transparency and layering create depth, not borders

## Layout Overhaul

### Remove: Centre clock domination
The analog clock should NOT be the centrepiece. Move it to a corner or make it a smaller accent element. The data is what matters on a wall dashboard.

### New Layout: 3-column weighted grid

```
┌─────────────────────┬──────────────────────┬─────────────────────┐
│                     │                      │                     │
│   SCHUMANN          │    LUNAR PHASE       │    WEATHER          │
│   (large card)      │    (hero card with   │    (current +       │
│   Big frequency     │     realistic moon)  │     forecast)       │
│   number + chart    │                      │                     │
│                     │                      │                     │
├─────────────────────┼──────────────────────┼─────────────────────┤
│                     │                      │                     │
│   KP INDEX          │    TIDAL             │   DAILY INSIGHT     │
│   (large card)      │    INTELLIGENCE      │   + BINARA REC      │
│   Big KP number     │    (wave chart)      │   + EARTH ENERGY    │
│   + chart           │                      │   (combined card)   │
│                     │                      │                     │
└─────────────────────┴──────────────────────┴─────────────────────┘
```

Grid: `grid-template-columns: 1fr 1.2fr 1fr` (centre column slightly wider for moon)
Rows: `1fr 1fr` — equal height, filling the viewport
Gap: 16-20px
Padding: 20-28px

The analog clock becomes a small elegant element in the top bar or bottom corner — NOT a full panel.

### Top Bar
- Left: Tartarian clock (small, ~60px) + digital time + date
- Centre: Alert badges (when active)
- Right: "HARMONIC WAVES" branding

## Background: Deep Space Atmosphere

### Layer 1 — Base gradient
```css
background: radial-gradient(ellipse at 30% 20%, #0d1528 0%, #080c18 40%, #050810 100%);
```
Deep navy-to-black, not pure black. Subtle blue undertones like deep space.

### Layer 2 — Star field
Canvas or CSS with ~200 tiny dots at varying opacity (0.1 to 0.6). A few "bright" stars at 0.8 opacity with a subtle twinkle animation. No movement — stars are fixed. This replaces the brass particle field.

### Layer 3 — Nebula glow (very subtle)
One or two radial gradient overlays at 3-5% opacity:
```css
background: radial-gradient(ellipse at 70% 30%, rgba(100, 60, 180, 0.04) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 70%, rgba(40, 100, 160, 0.03) 0%, transparent 50%);
```

### Layer 4 — Panels sit on top with glass morphism

## Card / Panel Style (Lunata DNA)

Replace the current flat panels with rich glass cards:

```css
.panel {
  background: rgba(12, 16, 28, 0.6);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.03) inset,
    0 4px 30px rgba(0, 0, 0, 0.3),
    0 0 60px rgba(80, 120, 200, 0.03);
  padding: 24px 28px;
}

/* Subtle top edge light — like light catching glass */
.panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 10%;
  right: 10%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent);
}
```

**Key differences from current:**
- Border is near-white at very low opacity (not brass)
- Inner box-shadow creates glass depth
- Outer shadow is much softer and larger
- Subtle blue ambient glow
- More padding — let content breathe
- Larger border radius (16px not 12px)

## Typography Scale (Wall-Monitor Readable)

Everything must be readable from 2-3 metres away on a 1920×1080 monitor.

```css
/* Primary values — the big numbers */
.value-primary {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(42px, 4vw, 56px);  /* Was 32px — way too small */
  font-weight: 300;
  letter-spacing: -1px;
}

/* Units next to values */
.value-unit {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(18px, 1.5vw, 22px);  /* Was 14px */
  opacity: 0.4;
}

/* Panel labels */
.panel-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(11px, 0.85vw, 13px);  /* Was 10px */
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
  color: rgba(180, 200, 255, 0.4);  /* Shifted from brass to cool blue-white */
}

/* Subtitles / descriptions */
.value-sub {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(14px, 1.1vw, 17px);  /* Was 13px */
  color: rgba(180, 200, 240, 0.45);
}

/* Data labels in grids */
.data-label {
  font-family: 'Cinzel', serif;
  font-size: clamp(9px, 0.65vw, 11px);
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(180, 200, 255, 0.3);
}

/* Data values in grids */
.data-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: clamp(14px, 1.1vw, 18px);
  color: rgba(220, 230, 255, 0.75);
}
```

## Colour Palette Shift

Move from warm brass to cool celestial — matches Lunata's deep space feel:

```css
:root {
  /* Backgrounds */
  --bg-deep: #050810;
  --bg-space: #0a0f1e;
  --bg-panel: rgba(12, 16, 28, 0.6);

  /* Text */
  --text-primary: rgba(220, 230, 255, 0.9);
  --text-secondary: rgba(180, 200, 240, 0.6);
  --text-dim: rgba(160, 180, 220, 0.35);
  --text-label: rgba(180, 200, 255, 0.4);

  /* Accents — keep some warmth for specific elements */
  --accent-gold: rgba(230, 200, 120, 0.9);      /* Clock hands, special highlights */
  --accent-lunar: rgba(255, 250, 235, 0.9);      /* Moon surface */
  --accent-schumann: rgba(120, 180, 255, 0.9);   /* Schumann data */
  --accent-kp-calm: rgba(100, 220, 170, 0.9);    /* KP calm */
  --accent-kp-elevated: rgba(255, 150, 80, 0.9); /* KP elevated */
  --accent-kp-storm: rgba(255, 80, 60, 0.9);     /* KP storm */
  --accent-tidal: rgba(80, 180, 230, 0.9);       /* Tidal data */
  --accent-binara: rgba(160, 120, 255, 0.8);     /* Binara */

  /* Glass borders */
  --border-glass: rgba(255, 255, 255, 0.06);
  --border-glass-highlight: rgba(255, 255, 255, 0.12);

  /* Status badge backgrounds */
  --badge-calm-bg: rgba(100, 220, 170, 0.1);
  --badge-elevated-bg: rgba(255, 150, 80, 0.12);
  --badge-storm-bg: rgba(255, 80, 60, 0.12);
}
```

## Sparkline Upgrades

Current sparklines are thin and hard to read. Make them:
- Taller — at least 100px height (was ~70px)
- Thicker line — 3px stroke (was 2.5px)
- Richer area fill gradient — more visible
- Larger endpoint glow dot
- Add faint horizontal grid lines at key values for context
- Animate the line drawing in on first render (optional, nice touch)

## Moon Phase — Realistic Rendering

The current moon is a simple SVG circle. Make it Lunata-quality:
- Larger (120-140px diameter)
- Realistic surface texture using a radial gradient with multiple stops to simulate craters
- Warm white illuminated side with soft edge
- Ambient glow: large soft radial gradient around the moon (radius 2x the moon)
- Dark side should have very faint detail (not pure black)
- Consider using canvas for the moon if SVG isn't rich enough

## Panel-Specific Redesign Notes

### Schumann Panel
- Huge frequency number (48-56px)
- Subtle pulsing glow on the number that matches the Schumann rhythm (~7.83 Hz visual pulse, sped up to ~0.5 Hz for visibility)
- Sparkline fills most of the card width and height
- Threshold line labelled directly on the chart

### KP Index Panel
- Huge KP number with colour that shifts smoothly between green → orange → red
- Status badge with more presence (larger, not tiny pill)
- Background of the entire panel subtly tints based on KP level (green ambient glow when calm, warm glow when elevated)

### Lunar Panel (centre hero)
- This is the showpiece — largest card
- Realistic moon centred and prominent
- Phase name below in Cinzel
- Illumination percentage
- Sign, element, next full moon, void of course arranged around the moon
- Subtle star dots behind the moon within the panel

### Weather Panel
- Current temp is the hero number (large)
- Condition icon larger
- Forecast row with more spacing
- Consider adding sunrise/sunset times

### Tidal Panel
- Wave-like sparkline that really feels like ocean
- Current height prominent
- Rising/falling badge more visual (maybe an animated arrow)

### Combined Insight + Binara + Earth Energy Panel
- Daily insight text is the hero (larger italic text)
- Below: Binara recommendation as a subtle accent card
- Below that: Earth energy bars (compact)
- This creates a "practitioner guidance" column

### Clock (relocated to top bar)
- Small Tartarian clock (~50-60px) in top-left corner
- Digital time next to it
- Date on the right side of the time
- Clock keeps its brass/gold aesthetic — warm accent against cool dashboard

## Animation Refinements

- Star twinkle: random stars fade in/out at different rates (CSS animation with varied delays)
- Panel hover: very subtle border brightness increase (for when you walk up to the monitor)
- Data transitions: numbers fade/slide when values update (not instant swap)
- Moon glow: gentle breathing animation on the ambient glow
- Sparkline: smooth data point transitions when new data arrives

## Implementation Approach

This is a visual overhaul, not a structural rebuild. The component architecture stays the same:
1. Update globals.css with new theme tokens and background layers
2. Update Panel.tsx with new glass style
3. Update each panel component for larger typography and new colours
4. Replace background from ParticleField to StarField
5. Relocate clock from centre panel to top bar
6. Rebuild grid from 5-col to 3-col layout
7. Enhance MoonPhase component for realistic rendering
8. Update Sparkline for larger, richer rendering

The data hooks, API routes, and binara engine stay untouched.
