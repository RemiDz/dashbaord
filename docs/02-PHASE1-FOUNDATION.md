# Phase 1 — Foundation

## Goal

Project scaffolding, theme system, shared components, and the grid layout with placeholder panels.

## Steps

### 1.1 — Scaffold Next.js Project

```bash
npx create-next-app@latest . --typescript --tailwind --app --src-dir --no-eslint
```

Install dependencies:
```bash
npm install swr
```

### 1.2 — Self-Host Fonts

Download and place in `public/fonts/`:
- Cinzel (400, 600, 700)
- Cormorant Garamond (300, 400, 500, 300italic)
- JetBrains Mono (300, 400)

Configure in `src/app/layout.tsx` using `next/font/local`.

### 1.3 — Theme System

Create `src/app/globals.css` with:
- Tailwind directives
- CSS custom properties (copy from 01-ARCHITECTURE.md theme tokens section)
- Keyframe animations: `breathe`, `pulseGlow`, `alertPulse`, `slideIn`
- Utility classes: `.panel-label`, `.value-large`, `.value-unit`, `.value-sub`

Extend `tailwind.config.ts`:
- Add custom colours referencing CSS variables
- Add custom font families
- Extend animation/keyframes

### 1.4 — Panel Wrapper Component

Create `src/components/shared/Panel.tsx`:
- Glass morphism background with backdrop blur
- Brass border with top highlight gradient (::before pseudo)
- Slide-in animation with configurable delay
- Pulse glow animation
- Accept `className`, `style`, `children`, `animationDelay` props

```tsx
interface PanelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animationDelay?: string;
}
```

### 1.5 — Dashboard Grid Layout

Create `src/components/dashboard/DashboardGrid.tsx`:

Grid specification (5 columns × 2 rows):
```
| Schumann (1,1) | KP Index (2,1) | Clock (3, 1-2) | Lunar (4,1) | Weather (5,1) |
| Tidal (1-2, 2) |                | (clock cont.)  | Energy (4,2)| Insight (5,2) |
```

- CSS Grid: `grid-template-columns: 1fr 1fr 280px 1fr 1fr`
- `grid-template-rows: 1fr 1fr`
- Gap: 14px
- Padding: 14px 24px 18px

Clock panel: `gridColumn: 3`, `gridRow: 1 / 3`
Tidal panel: `gridColumn: 1 / 3`, `gridRow: 2`

### 1.6 — Particle Field Background

Create `src/components/shared/ParticleField.tsx`:
- Full-screen fixed canvas, pointer-events: none
- Brass-coloured particles drifting slowly
- `intensity` prop controls particle count (1 = 40 particles, 2 = 80)
- Clean up animation frame on unmount
- Handle window resize

### 1.7 — Root Page

Create `src/app/page.tsx`:
- Full viewport, no overflow
- Background gradient
- Top bar with date (left), alert badges (right), "Harmonic Waves" branding (far right)
- Render DashboardGrid
- Render ParticleField behind everything

### 1.8 — Verify

- `npm run build` — zero errors
- `npm run dev` — opens to full-screen dark grid with empty brass-bordered panels
- No scrollbars at 1920×1080
- Panels have glass effect and subtle glow animation

## Deliverable

A running app showing the grid layout with styled empty panels, particle background, date bar, and Tartarian aesthetic. No data yet — just the shell.
