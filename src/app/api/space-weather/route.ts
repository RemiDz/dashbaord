import { NextResponse } from "next/server";

/**
 * Space Weather API route — fetches from NOAA SWPC (free, no key required).
 *
 * Endpoints used:
 * - alerts.json          — active space weather watches/warnings/alerts
 * - solar-wind/plasma    — solar wind speed and proton density
 * - solar-wind/mag       — Bz component (north/south)
 * - noaa-scales.json     — current NOAA scale levels (G/S/R)
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
  // Try to extract the first meaningful summary line
  const lines = message.split("\n").filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith("Space Weather Message") ||
      trimmed.startsWith("WATCH:") ||
      trimmed.startsWith("WARNING:") ||
      trimmed.startsWith("ALERT:") ||
      trimmed.startsWith("SUMMARY:") ||
      trimmed.startsWith("Extended Warning")
    ) {
      return trimmed.slice(0, 80);
    }
  }
  return lines[0]?.trim().slice(0, 80) ?? "Space Weather Alert";
}

export async function GET() {
  try {
    const [alertsRes, plasmaRes, magRes, scalesRes] = await Promise.allSettled([
      fetch(`${SWPC_BASE}/alerts.json`, { next: { revalidate: 600 } }),
      fetch(`${SWPC_BASE}/solar-wind/plasma-7-day.json`, { next: { revalidate: 600 } }),
      fetch(`${SWPC_BASE}/solar-wind/mag-7-day.json`, { next: { revalidate: 600 } }),
      fetch(`${SWPC_BASE}/noaa-scales.json`, { next: { revalidate: 600 } }),
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

    // ── Parse solar wind plasma (speed + density) ──
    let solarWindSpeed: number | null = null;
    let solarWindSpeedTrend: "rising" | "falling" | "stable" = "stable";
    let protonDensity: number | null = null;

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
      error: "Data temporarily unavailable",
    } satisfies SpaceWeatherData);
  }
}
