# CC Prompts — Dashboard Redesign (Lunata Style)

Save 06-REDESIGN-LUNATA-STYLE.md into your docs/ folder, then use these prompts in order.

---

## Prompt R1 — Theme & Background Overhaul
```
Read docs/06-REDESIGN-LUNATA-STYLE.md sections "Colour Palette Shift" 
and "Background: Deep Space Atmosphere". Overhaul the theme:

1. Replace all CSS custom properties with the new cool celestial palette 
   (shift from warm brass to cool blue-white tones, keep gold only for 
   clock and special accents)
2. Replace the ParticleField background with a StarField — a deep space 
   canvas with ~200 fixed tiny stars at varying opacity, a few bright 
   ones with subtle CSS twinkle animation, and 2-3 very faint nebula 
   radial gradient overlays
3. Update the base page background to the new deep space radial gradient
4. Update Panel.tsx to the new glass morphism style — more blur, 
   near-white borders at very low opacity, soft outer shadow, inner 
   box-shadow for depth, subtle top edge light via ::before pseudo

Do NOT change the layout or panel content yet — just the visual 
foundation.
```

## Prompt R2 — Layout Restructure
```
Read docs/06-REDESIGN-LUNATA-STYLE.md section "Layout Overhaul". 
Restructure the dashboard grid:

1. Change from 5-column to 3-column layout: 
   grid-template-columns: 1fr 1.2fr 1fr
   grid-template-rows: 1fr 1fr
2. Top row: Schumann (left), Lunar Phase (centre), Weather (right)
3. Bottom row: KP Index (left), Tidal (centre), combined Insight + 
   Binara + Earth Energy (right)
4. Move the Tartarian clock OUT of its own panel and into the top bar 
   — render it small (~50-60px) on the far left, with digital time 
   and date next to it. The clock keeps its brass/gold aesthetic as a 
   warm accent.
5. Alert badges stay in the top bar centre
6. "HARMONIC WAVES" branding stays top right

Delete the old ClockPanel from the grid. The clock component itself 
stays but renders smaller in the top bar.
```

## Prompt R3 — Typography Scale Up
```
Read docs/06-REDESIGN-LUNATA-STYLE.md section "Typography Scale". 
This dashboard is for a wall-mounted monitor read from 2-3 metres away. 
All text is currently too small. Update every panel:

1. Primary values (frequencies, temperatures, KP numbers): 
   font-size clamp(42px, 4vw, 56px) — these must be BIG
2. Units: clamp(18px, 1.5vw, 22px)
3. Panel labels: clamp(11px, 0.85vw, 13px)
4. Subtitles: clamp(14px, 1.1vw, 17px)
5. Data grid labels: clamp(9px, 0.65vw, 11px)
6. Data grid values: clamp(14px, 1.1vw, 18px)
7. Status badges: larger, more presence — not tiny pills
8. Update all colour references from brass tones to the new celestial 
   palette (text should be blue-white tones, not warm gold)

Test at 1920×1080 — everything must be comfortably readable.
```

## Prompt R4 — Realistic Moon & Enhanced Sparklines
```
Read docs/06-REDESIGN-LUNATA-STYLE.md sections "Moon Phase — Realistic 
Rendering" and "Sparkline Upgrades".

1. Rebuild the MoonPhase component — make it the showpiece of the Lunar 
   panel. Larger (120-140px), realistic surface texture using layered 
   radial gradients to simulate craters and terrain, warm white 
   illuminated side with soft edge transition, large ambient glow 
   (2x radius) around the moon, dark side with very faint detail. 
   Reference how lunata.app renders its moon. Add a gentle breathing 
   animation on the glow.

2. Upgrade all Sparklines — taller (100px minimum), thicker stroke (3px), 
   richer area fill gradient, larger glowing endpoint dot. Add faint 
   horizontal reference lines at key values. The tidal sparkline should 
   feel wave-like and organic.

3. In the Lunar panel, arrange the moon prominently in the centre with 
   phase name, illumination, sign, element, next full moon, and void of 
   course arranged around it. Consider adding subtle star dots within 
   the panel background behind the moon.
```

## Prompt R5 — Panel-Specific Polish
```
Read docs/06-REDESIGN-LUNATA-STYLE.md section "Panel-Specific Redesign 
Notes". Polish each panel:

1. Schumann: Add a subtle pulsing glow on the frequency number. The 
   sparkline should fill generous space within the card.

2. KP Index: The panel background should subtly tint based on KP level 
   — faint green ambient glow when calm, warm orange when elevated. 
   Colour transitions should be smooth.

3. Weather: Make the current temp the hero number. Larger condition icon. 
   Add sunrise/sunset times if the API provides them.

4. Tidal: The rising/falling indicator could use a subtle animated arrow. 
   The sparkline should feel oceanic.

5. Combined right panel (bottom-right): Daily Insight text as the hero 
   in larger italic Cormorant Garamond. Below that, Binara recommendation 
   as a compact accent card. Below that, Earth Energy bars (compact). 
   This creates a "practitioner guidance" column.

6. Add smooth number transitions — when data updates, values should 
   fade/slide, not instantly swap.
```

## Prompt R6 — Final Verify & Deploy
```
Run npm run build and fix any errors. Run npm run dev and verify:

- Deep space background with stars and subtle nebula visible
- All panels use the new glass morphism style with depth
- Typography is large and readable from across a room
- Moon renders realistically with ambient glow
- Clock is small and elegant in the top bar, brass accent
- Sparklines are taller and richer
- KP panel tints based on current value
- 3-column layout fills the screen with minimal dead space
- No scrollbars at 1920×1080
- Animations are subtle and performant

Once verified, commit and push:
git add .
git commit -m "Redesign: Lunata-inspired immersive cosmic aesthetic"
git push origin main
```

---

## If the moon doesn't look good enough:
```
The moon needs to look more realistic, like lunata.app. Use a canvas 
instead of SVG. Layer multiple radial gradients for surface texture — 
vary the grey tones to simulate mare (dark patches) and highlands 
(lighter areas). The terminator (shadow edge) should be a soft gradient, 
not a hard line. Add a subtle outer glow that breathes. The illuminated 
side should have a warm cream tint, not pure white. This is the visual 
centrepiece of the dashboard.
```

## If panels still feel flat:
```
The panels need more depth. Increase backdrop-filter blur to 30px. Add 
a second inner box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.04) inset. 
Add a very subtle gradient overlay inside each panel — lighter at top, 
darker at bottom — to simulate glass refraction. The top edge ::before 
highlight should be more visible. Overall the panels should feel like 
frosted glass floating in space.
```
