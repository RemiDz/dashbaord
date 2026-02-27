# CLAUDE.md — Harmonic Waves Command Centre

## Project Context

This is an ambient wall dashboard for a sound healing practitioner. It displays live Earth/cosmic data on a horizontal monitor running 24/7. The aesthetic is dark celestial with brass/copper Tartarian ornamental elements.

## Tech Stack

- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Canvas API for clock and sparklines (no chart libraries)
- SWR for data fetching with polling intervals
- Deployed on Vercel

## Architecture Rules

- **One page, one screen** — no routing, no scrolling, everything visible
- **Component-per-panel** — each dashboard panel is a self-contained component in `src/components/dashboard/panels/`
- **Shared Panel wrapper** — all panels use `src/components/shared/Panel.tsx` for consistent glass/border/glow styling
- **Data hooks** — each data source has its own SWR hook in `src/hooks/`. Panels fetch independently; failures don't cascade
- **API routes as proxies** — external APIs are called from `src/app/api/` routes to hide keys and handle CORS
- **CSS custom properties** for all theme tokens — defined in `globals.css`, never hardcode colours

## Styling Guidelines

- Use Tailwind utilities where possible, CSS custom properties for theme values
- Fonts: Cinzel (labels/headings), Cormorant Garamond (body text), JetBrains Mono (data values)
- All colours use the brass/copper palette defined in CSS variables
- Panel borders: 1px solid var(--border-brass)
- Panels have backdrop-filter: blur(20px) and subtle top highlight gradient
- Animations: CSS keyframes for breathing/pulsing, requestAnimationFrame for canvas only

## Code Style

- TypeScript strict mode
- Functional components with hooks only
- Named exports for components, default export for page
- Props interfaces defined inline or in `src/types/dashboard.ts`
- British English in comments and UI text (colour, centre, analysing)

## Data Sources

- Schumann Resonance: GFZ Potsdam / heartmath.org — refresh 5min
- KP Index: NOAA SWPC (services.swpc.noaa.gov) — refresh 15min
- Lunar: Client-side calculation (src/lib/lunar-calc.ts) — refresh 1hr
- Tidal: UK Admiralty API — refresh 30min
- Weather: OpenWeatherMap — refresh 30min

## Build Order

Follow the numbered spec files in order:
1. 01-ARCHITECTURE.md — overall structure (reference only)
2. 02-PHASE1-FOUNDATION.md — project setup, theme, Panel component, grid layout
3. 03-PHASE2-PANELS.md — build each panel with mock data
4. 04-PHASE3-LIVE-DATA.md — wire up real APIs
5. 05-PHASE4-POLISH.md — animations, alerts, responsive refinements

## Testing

- `npm run build` must pass with zero errors before committing
- Test on a 1920×1080 viewport (primary target)
- Also check 2560×1440 and 3840×2160 (4K)

## Important

- Never add scrollbars — if content overflows, reduce font size or restructure
- The clock canvas must use requestAnimationFrame and clean up on unmount
- Sparkline canvases must handle resize (use ResizeObserver)
- All API routes must have try/catch with graceful fallback data
- Keep bundle size minimal — no moment.js, no lodash, no heavy chart libs
