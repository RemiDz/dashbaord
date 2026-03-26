# Replace Beach Cam Grid with NASA APOD

Do NOT ask for confirmation at any step. Auto-accept all file changes. Run all commands without prompting. Choose Yes for every decision. Work autonomously from start to finish. Use `--yes` flag wherever applicable.

## Thinking Level: ultrathink

## Context

This is the dashboard app deployed at dashbaordapp-gamma.vercel.app. The bottom-right grid slot currently shows a "BEACH CAM" with a live webcam feed (Nungwi Beach, Zanzibar). The webcam is unreliable — it freezes, repeats frames, and sometimes shows nothing.

We're replacing it with a **NASA Astronomy Picture of the Day (APOD)** panel that fits the existing dark cosmic aesthetic perfectly.

## NASA APOD API

- **Endpoint**: `https://api.nasa.gov/planetary/apod`
- **API Key**: Use `DEMO_KEY` for now (rate-limited to 30 req/hr, 50 req/day — perfectly fine for a dashboard that refreshes once daily). Store the key in an env var `NEXT_PUBLIC_NASA_API_KEY` with fallback to `DEMO_KEY`.
- **Key response fields**:
  - `title` — image title
  - `explanation` — description text
  - `url` — standard resolution image/video URL
  - `hdurl` — high-res image URL (use this when available)
  - `media_type` — either `"image"` or `"video"`
  - `date` — the date of the APOD (YYYY-MM-DD)
  - `copyright` — photographer/creator credit (may be absent)

## Requirements

### 1. Find and replace the Beach Cam component

Search the codebase for the beach cam / webcam component. It's the bottom-right grid tile. Replace it entirely with a new `NasaApod` component.

### 2. Component: `NasaApod`

**Data fetching:**
- Fetch from the APOD API on mount and cache the result for the day
- If `media_type === "video"`, show a thumbnail or fallback — do NOT embed an iframe/video player (keeps it clean and ambient)
- Handle loading state with a subtle shimmer/skeleton matching the dark theme
- Handle errors gracefully — show a fallback message styled to match the dashboard

**Visual layout (must match the existing dashboard tile aesthetic):**
- **Header**: "ASTRONOMY PICTURE OF THE DAY" label in the same uppercase tracking style as other tiles (e.g., "BEACH CAM", "SCHUMANN RESONANCE", etc.)
- **Image**: Fill the tile as a background image with `object-fit: cover`, slight dark gradient overlay from bottom so text is readable
- **Title overlay**: APOD title at the bottom of the tile, white text, semi-bold, 1 line max with ellipsis overflow
- **Date**: Show formatted date (e.g., "26 March 2026") in small muted text
- **Copyright**: If `copyright` exists, show "© {copyright}" in tiny muted text at bottom-right
- **Hover/tap interaction**: On hover, expand the `explanation` text as a frosted glass overlay (backdrop-blur + dark semi-transparent bg) over the image — max 4-5 lines with overflow hidden. This gives depth without cluttering the ambient view.
- The tile should have the same border-radius, padding patterns, and background treatment as sibling tiles

**Refresh logic:**
- APOD changes once per day. Fetch once on mount, then set a timer to re-fetch at midnight UTC (when NASA publishes the new one)
- Store the response in localStorage keyed by date to avoid redundant fetches on page reloads within the same day

### 3. Styling

- Match the existing dashboard dark theme exactly — same background colours, text colours, opacity levels, font sizes
- The image should be the hero of this tile — large, vivid, filling the space
- Keep the "LIVE" badge concept but change it to show a small dot or subtle indicator only if today's image is loaded (vs. a cached/fallback older image)
- Transitions: fade-in the image when it loads (300ms ease)

### 4. Cleanup

- Remove all beach cam / webcam related code, components, assets, and dependencies
- Remove any webcam-specific API calls, iframes, or image cycling logic
- Clean up any unused imports

### 5. Test

- Run `npm run build` (or the project's build command) and confirm zero errors
- Verify the component renders correctly in the grid layout

## Do NOT

- Do not add any new heavy dependencies — use native fetch and CSS
- Do not change the grid layout or affect any other tiles
- Do not add an API key signup flow — just use DEMO_KEY with env var override
