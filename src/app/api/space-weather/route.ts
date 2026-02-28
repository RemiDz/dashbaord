import { NextResponse } from "next/server";

/**
 * Space Weather API route — fetches from NOAA SWPC (free, no key required).
 *
 * Endpoints used:
 * - alerts.json          — active space weather watches/warnings/alerts
 * - solar-wind/plasma    — solar wind speed and proton density
 * - solar-wind/mag       — Bz component (north/south)
 * - noaa-scales.json     — current NOAA scale levels (G/S/R)
 * - summary/10cm-flux    — Solar Flux Index (SFI)
 * - summary/solar-flares — latest solar flare class
 */

const SWPC_BASE = "https://services.swpc.noaa.gov/products";

interface SpaceWeatherAlert {
  message: string;
  severity: "green" | "yellow" | "orange" | "red";
  type: string;
  issued: string;
}

interface SpaceWeatherData {
  alerts: SpaceWeatherAlert[];
  solarWindSpeed: number | null;
  solarWindSpeedTrend: "rising" | "falling" | "stable";
  bzComponent: number | null;
  bzDirection: "north" | "south" | "neutral";
  protonDensity: number | null;
  geomagScale: string;
  solarRadScale: string;
  radioBlackout: string;
  solarFlux: number | null;
  latestFlare: string | null;
  solarWindHistory: number[];
  error?: string;
}

function classifyAlertSeverity(message: string): "green" | "yellow" | "orange" | "red" {
  const upper = message.toUpperCase();
  if (upper.includes("WARNING") || upper.includes("EXTREME") || upper.includes("SEVERE"))
    return "red";
  if (upper.includes("WATCH") || upper.includes("STRONG") || upper.includes("MODERATE"))
    return "orange";
  if (upper.includes("ALERT") || upper.includes("MINOR"))
    return "yellow";
  return "green";
}

function extractAlertType(message: string): string {
  const lines = message.split("\n").filter((l) => l.trim().length > 0);

  // Look for descriptive event lines like "Geomagnetic Storm Watch",
  // "Solar Radiation Storm Warning", "Radio Blackout Warning" etc.
  for (const line of lines) {
    const trimmed = line.trim();

    // Skip the raw code line (e.g. "Space Weather Message Code: WARK04")
    if (trimmed.startsWith("Space Weather Message Code:")) continue;
    // Skip serial number lines
    if (trimmed.startsWith("Serial Number:")) continue;
    // Skip date/time lines
    if (trimmed.startsWith("Issue Time:")) continue;

    // Match prefixed lines: WATCH: ..., WARNING: ..., ALERT: ..., SUMMARY: ...
    const prefixMatch = trimmed.match(
      /^(WATCH|WARNING|ALERT|SUMMARY|EXTENDED WARNING):\s*(.+)/i,
    );
    if (prefixMatch) {
      const body = prefixMatch[2].trim();
      // Try to extract a severity level like G2, S1, R1
      const levelMatch = message.match(/\b([GSR]\d)\b/);
      const level = levelMatch ? ` (${levelMatch[1]})` : "";
      return `${body}${level}`.slice(0, 100);
    }

    // Match standalone descriptive lines containing known event types
    if (
      /geomagnetic storm/i.test(trimmed) ||
      /solar radiation storm/i.test(trimmed) ||
      /radio blackout/i.test(trimmed) ||
      /coronal mass ejection/i.test(trimmed) ||
      /solar flare/i.test(trimmed) ||
      /proton event/i.test(trimmed) ||
      /electron event/i.test(trimmed)
    ) {
      const levelMatch = message.match(/\b([GSR]\d)\b/);
      const level = levelMatch ? ` (${levelMatch[1]})` : "";
      return `${trimmed}${level}`.slice(0, 100);
    }
  }

  // Fallback: use first non-code, non-empty line
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed.startsWith("Space Weather Message Code:") &&
      !trimmed.startsWith("Serial Number:") &&
      !trimmed.startsWith("Issue Time:")
    ) {
      return trimmed.slice(0, 100);
    }
  }

  return "Space Weather Alert";
}

export async function GET() {
  try {
    const [alertsRes, plasmaRes, magRes, scalesRes, fluxRes, flaresRes] =
      await Promise.allSettled([
        fetch(`${SWPC_BASE}/alerts.json`, { next: { revalidate: 600 } }),
        fetch(`${SWPC_BASE}/solar-wind/plasma-7-day.json`, { next: { revalidate: 600 } }),
        fetch(`${SWPC_BASE}/solar-wind/mag-7-day.json`, { next: { revalidate: 600 } }),
        fetch(`${SWPC_BASE}/noaa-scales.json`, { next: { revalidate: 600 } }),
        fetch(`${SWPC_BASE}/summary/10cm-flux.json`, { next: { revalidate: 600 } }),
        fetch(`${SWPC_BASE}/summary/solar-flares-24-hour.json`, { next: { revalidate: 600 } }),
      ]);

    // ── Parse alerts ──
    const alerts: SpaceWeatherAlert[] = [];
    if (alertsRes.status === "fulfilled" && alertsRes.value.ok) {
      try {
        const alertData = await alertsRes.value.json();
        // alerts.json is an array of { product_id, message, issue_datetime }
        // Get the last ~5 alerts (most recent)
        const recentAlerts = Array.isArray(alertData) ? alertData.slice(-5) : [];
        for (const a of recentAlerts) {
          const msg = a.message || "";
          alerts.push({
            message: msg,
            severity: classifyAlertSeverity(msg),
            type: extractAlertType(msg),
            issued: a.issue_datetime || "",
          });
        }
      } catch {
        // Alert parsing is non-critical
      }
    }

    // ── Parse solar wind plasma (speed + density + history) ──
    let solarWindSpeed: number | null = null;
    let solarWindSpeedTrend: "rising" | "falling" | "stable" = "stable";
    let protonDensity: number | null = null;
    const solarWindHistory: number[] = [];

    if (plasmaRes.status === "fulfilled" && plasmaRes.value.ok) {
      try {
        const plasmaData = await plasmaRes.value.json();
        // Format: array of arrays, first row is header
        // [time_tag, density, speed, temperature]
        if (Array.isArray(plasmaData) && plasmaData.length > 2) {
          const recent = plasmaData.filter(
            (row: string[]) => row[2] && !isNaN(parseFloat(row[2])),
          );
          if (recent.length >= 2) {
            const last = recent[recent.length - 1];
            const prev = recent[Math.max(1, recent.length - 10)]; // ~10 entries back for trend
            solarWindSpeed = Math.round(parseFloat(last[2]));
            protonDensity = parseFloat(parseFloat(last[1]).toFixed(1));

            const prevSpeed = parseFloat(prev[2]);
            const diff = solarWindSpeed - prevSpeed;
            if (diff > 20) solarWindSpeedTrend = "rising";
            else if (diff < -20) solarWindSpeedTrend = "falling";

            // Extract last ~24 data points for sparkline
            const historySlice = recent.slice(-24);
            for (const row of historySlice) {
              const speed = parseFloat(row[2]);
              if (!isNaN(speed)) solarWindHistory.push(Math.round(speed));
            }
          }
        }
      } catch {
        // Plasma parsing non-critical
      }
    }

    // ── Parse Bz component ──
    let bzComponent: number | null = null;
    let bzDirection: "north" | "south" | "neutral" = "neutral";

    if (magRes.status === "fulfilled" && magRes.value.ok) {
      try {
        const magData = await magRes.value.json();
        // Format: array of arrays, first row is header
        // [time_tag, bx_gsm, by_gsm, bz_gsm, lon_gsm, lat_gsm, bt]
        if (Array.isArray(magData) && magData.length > 2) {
          const recent = magData.filter(
            (row: string[]) => row[3] && !isNaN(parseFloat(row[3])),
          );
          if (recent.length >= 1) {
            const last = recent[recent.length - 1];
            bzComponent = parseFloat(parseFloat(last[3]).toFixed(1));
            if (bzComponent < -2) bzDirection = "south";
            else if (bzComponent > 2) bzDirection = "north";
          }
        }
      } catch {
        // Mag parsing non-critical
      }
    }

    // ── Parse NOAA scales ──
    let geomagScale = "G0";
    let solarRadScale = "S0";
    let radioBlackout = "R0";

    if (scalesRes.status === "fulfilled" && scalesRes.value.ok) {
      try {
        const scales = await scalesRes.value.json();
        // noaa-scales.json has structure: { "0": { "G": {...}, "S": {...}, "R": {...} } }
        if (scales && typeof scales === "object") {
          const current = scales["0"] || scales[0];
          if (current) {
            const gScale = current.G?.Scale;
            const sScale = current.S?.Scale;
            const rScale = current.R?.Scale;
            if (gScale !== undefined) geomagScale = `G${gScale}`;
            if (sScale !== undefined) solarRadScale = `S${sScale}`;
            if (rScale !== undefined) radioBlackout = `R${rScale}`;
          }
        }
      } catch {
        // Scale parsing non-critical
      }
    }

    // ── Parse Solar Flux Index (10.7cm flux) ──
    let solarFlux: number | null = null;

    if (fluxRes.status === "fulfilled" && fluxRes.value.ok) {
      try {
        const fluxData = await fluxRes.value.json();
        // Returns { "Flux": "123", "TimeStamp": "..." }
        if (fluxData && fluxData.Flux) {
          const val = parseFloat(fluxData.Flux);
          if (!isNaN(val)) solarFlux = Math.round(val);
        }
      } catch {
        // SFI parsing non-critical
      }
    }

    // ── Parse latest solar flare ──
    let latestFlare: string | null = null;

    if (flaresRes.status === "fulfilled" && flaresRes.value.ok) {
      try {
        const flaresData = await flaresRes.value.json();
        // Returns summary object with class info
        if (flaresData) {
          // The summary endpoint returns something like:
          // { "24hr_class": "C2.1", "latest_event": {...} }
          // or could be an object with a class field
          if (flaresData["24hr_class"] && flaresData["24hr_class"] !== "none") {
            latestFlare = flaresData["24hr_class"];
          } else if (flaresData.class && flaresData.class !== "none") {
            latestFlare = flaresData.class;
          } else if (typeof flaresData === "string" && flaresData.trim()) {
            latestFlare = flaresData.trim();
          }
        }
      } catch {
        // Flare parsing non-critical
      }
    }

    const result: SpaceWeatherData = {
      alerts: alerts.reverse(), // Most recent first
      solarWindSpeed,
      solarWindSpeedTrend,
      bzComponent,
      bzDirection,
      protonDensity,
      geomagScale,
      solarRadScale,
      radioBlackout,
      solarFlux,
      latestFlare,
      solarWindHistory,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Space weather fetch error:", error);
    return NextResponse.json({
      alerts: [],
      solarWindSpeed: null,
      solarWindSpeedTrend: "stable",
      bzComponent: null,
      bzDirection: "neutral",
      protonDensity: null,
      geomagScale: "G0",
      solarRadScale: "S0",
      radioBlackout: "R0",
      solarFlux: null,
      latestFlare: null,
      solarWindHistory: [],
      error: "Data temporarily unavailable",
    } satisfies SpaceWeatherData);
  }
}
