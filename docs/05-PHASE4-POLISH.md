# Phase 4 — Polish & Production

## Goal

Elevate from functional to exceptional. Add data-driven animations, refine the Tartarian aesthetic, handle edge cases, and prepare for deployment.

## 4.1 — Data-Driven Animations

### Particle Field Reactivity
- KP ≥ 3: Double particle count, increase drift speed slightly
- KP ≥ 5: Triple particles, add warm tint to particles
- Schumann spike (> 9 Hz): Brief ripple/wave effect through particles

### Sparkline Pulse
- When latest data point exceeds threshold, add a subtle glow pulse on the sparkline's endpoint dot
- Use CSS animation class toggled by data condition

### Panel Border Glow
- Panels with "alert" conditions get a slightly brighter border glow
- KP panel glows orange when elevated
- Schumann panel glows gold when spiking

### Clock Breathing
- Second hand opacity subtly modulates (very gentle breathing effect)
- Clock outer ring brightness responds to time of day (slightly brighter during "golden hours" sunrise/sunset)

## 4.2 — Alert Badge Refinements

- Badges slide in from right when conditions trigger
- Slide out when conditions resolve
- Add subtle sound notification option (future — use Web Audio API for a gentle chime)
- Badge hover state shows brief explanation (e.g. "KP index reached 3.2 — significant geomagnetic activity")

## 4.3 — Insight Panel Intelligence

Expand the insight generation logic:

```typescript
// src/lib/insight-engine.ts
interface EarthState {
  kp: number;
  schumannDeviation: number;
  moonPhase: string;
  moonSign: string;
  moonElement: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  tidalState: 'rising' | 'falling' | 'high' | 'low';
}

function generateInsight(state: EarthState): string {
  // Build contextual practitioner guidance
  // Reference specific instruments, techniques, chakras
  // based on combined conditions
}
```

Template examples:
- High KP + Fire moon → "Geomagnetic storms amplify energy sensitivity. Ground with low-frequency drumming and Tibetan bowls before heart work."
- Full moon + Water sign → "Full moon in a water sign deepens emotional release. Crystal bowls in D and A will support flow."
- Calm KP + Earth sign → "Stable Earth energy today — ideal for deep monochord sessions and overtone work."
- Rising tide + morning → "Rising tidal energy mirrors the morning expansion. Open sessions with ascending frequency sweeps."

## 4.4 — Responsive Refinements

Primary target: 1920×1080 (Full HD horizontal monitor)

Also support:
- **2560×1440 (QHD):** Scale up fonts slightly, more breathing room
- **3840×2160 (4K):** Ensure canvas renders at proper DPI, scale appropriately
- **1366×768 (small laptop — for testing only):** Reduce panel padding, smaller fonts, clock scales down

Use CSS clamp() for key font sizes:
```css
.value-large { font-size: clamp(24px, 2.5vw, 36px); }
.panel-label { font-size: clamp(9px, 0.7vw, 11px); }
```

Canvas components must check `devicePixelRatio` and render at appropriate resolution.

## 4.5 — Performance Optimisation

- **Canvas rendering:** Only redraw when data changes (sparklines) or continuously (clock). Use separate animation loops.
- **SWR deduplication:** Ensure multiple components don't trigger duplicate fetches
- **React.memo:** Wrap panels that don't need re-render on every tick (everything except ClockPanel)
- **Particle field:** Cap at 60fps, use `will-change: transform` on canvas
- **Font loading:** Use `font-display: swap` to prevent FOIT

Target: Consistent 60fps with all panels rendering and clock animating.

## 4.6 — Sacred Geometry Background Details

Add subtle background elements (very low opacity, behind panels):
- Flower of Life pattern: SVG overlay at 2-3% opacity, centred
- Or: concentric circles emanating from clock position
- Or: golden ratio spiral, very faint

Pick ONE — this should be barely perceptible, adding depth without distraction. Implement as a fixed-position SVG or canvas layer between the gradient background and the panels.

## 4.7 — Favicon & Meta

- Create a simple favicon: brass circle with inner geometry (SVG → PNG)
- Page title: "Harmonic Waves — Command Centre"
- Meta: no-index (private dashboard for now)
- Add `<meta name="theme-color" content="#0a0a14" />` for browser chrome

## 4.8 — Deployment Prep

### Vercel Configuration
- Framework: Next.js (auto-detected)
- Environment variables: Set in Vercel dashboard
- No custom domain yet — use default `xxx.vercel.app`

### vercel.json (if needed)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" }
      ]
    }
  ]
}
```

### Checklist before deploy
- [ ] `npm run build` passes with zero errors and zero warnings
- [ ] All API keys in .env.local.example documented
- [ ] .env.local is in .gitignore
- [ ] No console.log statements left (use console.error for actual errors)
- [ ] Tested at 1920×1080 — no scrollbars, all panels visible
- [ ] Clock runs smoothly for 10+ minutes without memory leaks
- [ ] Each API route handles errors gracefully
- [ ] Favicon renders correctly

## 4.9 — Future TODO (not for now)

Document these for later:
- [ ] Drag-and-drop panel reordering
- [ ] Panel show/hide config
- [ ] Multiple layout presets
- [ ] Push notifications for alerts
- [ ] Audio chime on threshold events
- [ ] Sonarus.app integration
- [ ] Overtone Singer integration
- [ ] Social media auto-post feature
- [ ] PRO tier with custom alerts
- [ ] Multi-location weather
- [ ] Aurora probability panel
- [ ] Planetary hours display
