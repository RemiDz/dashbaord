"use client";

import { memo, useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { useSpaceWeather } from "@/hooks/useSpaceWeather";

interface SpaceWeatherPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  green: "rgba(100, 220, 170, 0.9)",
  yellow: "rgba(230, 200, 80, 0.9)",
  orange: "rgba(255, 150, 80, 0.9)",
  red: "rgba(255, 80, 60, 0.9)",
};

const TREND_ARROWS: Record<string, string> = {
  rising: "↑",
  falling: "↓",
  stable: "→",
};

function getBzColor(bz: number | null, direction: string): string {
  if (bz === null) return "var(--text-dim)";
  if (direction === "south") return "rgba(255, 150, 80, 0.9)"; // south is geo-effective
  if (direction === "north") return "rgba(100, 220, 170, 0.9)";
  return "var(--text-secondary)";
}

function getScaleColor(scale: string): string {
  const level = parseInt(scale.slice(1), 10);
  if (level >= 4) return "rgba(255, 80, 60, 0.9)";
  if (level >= 3) return "rgba(255, 150, 80, 0.9)";
  if (level >= 1) return "rgba(230, 200, 80, 0.9)";
  return "rgba(100, 220, 170, 0.9)";
}

function getFlareColor(flare: string | null): string {
  if (!flare) return "rgba(100, 220, 170, 0.9)";
  const upper = flare.toUpperCase();
  if (upper.startsWith("X")) return "rgba(255, 80, 60, 0.9)";
  if (upper.startsWith("M")) return "rgba(255, 150, 80, 0.9)";
  if (upper.startsWith("C")) return "rgba(230, 200, 80, 0.9)";
  return "rgba(100, 220, 170, 0.9)";
}

// Common NOAA alert code summaries
const ALERT_SUMMARIES: Record<string, string> = {
  WARK: "Geomagnetic activity may affect sensitive electronics and auroral visibility at high latitudes.",
  WATA: "Solar wind disturbance expected. May cause power grid irregularities and extended aurora visibility.",
  WATK: "Geomagnetic storm conditions expected. Aurora may be visible at lower latitudes than usual.",
  ALTEF: "Elevated radiation levels may affect satellite operations and high-altitude communications.",
  ALTPX: "Elevated proton levels detected. May impact HF radio propagation at polar latitudes.",
  ALTTP: "Geomagnetic storm in progress. Possible power grid fluctuations and degraded GPS accuracy.",
  WARSUD: "Sudden impulse detected in Earth's magnetic field from a solar wind shock.",
  SUM: "Solar activity summary — monitoring ongoing conditions.",
  SUMSUD: "Geomagnetic sudden impulse observed from coronal mass ejection arrival.",
};

function getAlertSummary(message: string): string {
  // Try to match alert code from message
  const codeMatch = message.match(/Message Code:\s*(\w+)/i);
  if (codeMatch) {
    const code = codeMatch[1].toUpperCase();
    for (const [prefix, summary] of Object.entries(ALERT_SUMMARIES)) {
      if (code.startsWith(prefix)) return summary;
    }
  }

  // Fallback: extract first meaningful sentence from message body
  const lines = message.split("\n").filter((l) => l.trim().length > 0);
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("Space Weather") || t.startsWith("Serial") || t.startsWith("Issue") || t.length < 15) continue;
    if (/^(Watch|Warning|Alert|Summary|Extended|Cancel)/i.test(t)) continue;
    // Return first substantive line, truncated
    return t.length > 150 ? t.slice(0, 147) + "…" : t;
  }

  return "";
}

function AlertDisplay({ alert, fadeIn }: { alert: { message: string; severity: string; type: string }; fadeIn: boolean }) {
  const summary = getAlertSummary(alert.message);
  return (
    <div
      className="flex-1 flex flex-col justify-center"
      style={{
        transition: "opacity 0.5s ease",
        opacity: fadeIn ? 1 : 0,
      }}
    >
      <p
        className="font-body"
        style={{
          fontSize: "clamp(14px, 1.2vw, 18px)",
          fontWeight: 400,
          color: SEVERITY_COLORS[alert.severity] ?? "var(--text-primary)",
          lineHeight: 1.4,
        }}
      >
        {alert.type}
      </p>
      {summary && (
        <p
          className="font-body"
          style={{
            fontSize: "clamp(11px, 0.9vw, 14px)",
            fontWeight: 300,
            color: "rgba(220, 230, 255, 0.5)",
            lineHeight: 1.4,
            marginTop: 4,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {summary}
        </p>
      )}
    </div>
  );
}

export const SpaceWeatherPanel = memo(function SpaceWeatherPanel({
  style,
  animationDelay,
}: SpaceWeatherPanelProps) {
  const sw = useSpaceWeather();

  const hasAlerts = sw.alerts.length > 0;
  const highestSeverity = hasAlerts
    ? sw.alerts.reduce(
        (max, a) => {
          const order = { green: 0, yellow: 1, orange: 2, red: 3 };
          return order[a.severity] > order[max] ? a.severity : max;
        },
        "green" as "green" | "yellow" | "orange" | "red",
      )
    : "green";

  // Rotate through alerts every 10s
  const [alertIdx, setAlertIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  useEffect(() => {
    if (sw.alerts.length <= 1) return;
    const id = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setAlertIdx((i) => (i + 1) % sw.alerts.length);
        setFadeIn(true);
      }, 500);
    }, 30_000);
    return () => clearInterval(id);
  }, [sw.alerts.length]);

  return (
    <Panel
      className="flex flex-col relative overflow-hidden"
      style={style}
      animationDelay={animationDelay}
      glowColor={
        highestSeverity === "red" || highestSeverity === "orange"
          ? SEVERITY_COLORS[highestSeverity]
          : undefined
      }
    >
      <span className="panel-label">Space Weather</span>

      {/* ── NOAA Scales ── */}
      <div className="flex items-center gap-3 mt-2">
        {[
          { label: "Geomag", value: sw.geomagScale },
          { label: "Solar", value: sw.solarRadScale },
          { label: "Radio", value: sw.radioBlackout },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1"
          >
            <span className="data-label" style={{ fontSize: "0.55rem" }}>
              {s.label}
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "clamp(12px, 0.85vw, 14px)",
                fontWeight: 400,
                color: getScaleColor(s.value),
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* ── Glass divider ── */}
      <div
        className="w-full my-2"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* ── Data grid — 2 columns ── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        <DataRow
          label="Solar Wind"
          value={sw.solarWindSpeed !== null ? `${sw.solarWindSpeed}` : "—"}
          unit="km/s"
          suffix={
            sw.solarWindSpeed !== null
              ? TREND_ARROWS[sw.solarWindSpeedTrend]
              : undefined
          }
          color={
            sw.solarWindSpeed !== null && sw.solarWindSpeed > 500
              ? "rgba(255, 150, 80, 0.9)"
              : undefined
          }
        />

        <DataRow
          label="Bz Component"
          value={sw.bzComponent !== null ? `${sw.bzComponent}` : "—"}
          unit="nT"
          suffix={
            sw.bzDirection === "south"
              ? "↓S"
              : sw.bzDirection === "north"
                ? "↑N"
                : undefined
          }
          color={getBzColor(sw.bzComponent, sw.bzDirection)}
        />

        <DataRow
          label="Proton Density"
          value={sw.protonDensity !== null ? `${sw.protonDensity}` : "—"}
          unit="p/cm³"
          color={
            sw.protonDensity !== null && sw.protonDensity > 10
              ? "rgba(255, 150, 80, 0.9)"
              : undefined
          }
        />

        <DataRow
          label="Solar Flux"
          value={sw.solarFlux !== null ? `${sw.solarFlux}` : "—"}
          unit="SFU"
          color={
            sw.solarFlux !== null && sw.solarFlux > 150
              ? "rgba(255, 150, 80, 0.9)"
              : undefined
          }
        />

        <DataRow
          label="Latest Flare"
          value={sw.latestFlare ?? "Quiet"}
          unit=""
          color={getFlareColor(sw.latestFlare)}
        />
      </div>

      {/* ── Solar Wind Sparkline with thresholds ── */}
      {sw.solarWindHistory.length >= 2 && (
        <div className="mt-2">
          <span className="data-label" style={{ fontSize: "0.5rem", marginBottom: 4, display: "block" }}>
            Solar Wind 24hr
          </span>
          <Sparkline
            data={sw.solarWindHistory}
            color="rgba(160, 120, 255, 0.8)"
            height={50}
            showArea={true}
            threshold={400}
            thresholdColor="rgba(160, 120, 255, 0.15)"
            referenceLines={0}
          />
        </div>
      )}

      {/* ── Alert container ── */}
      <div
        className="mt-2 flex-1 min-h-0 flex flex-col"
        style={{
          background: hasAlerts
            ? SEVERITY_COLORS[highestSeverity].replace(/[\d.]+\)$/, "0.04)")
            : "rgba(100, 220, 170, 0.02)",
          borderTop: `1px solid ${hasAlerts ? SEVERITY_COLORS[highestSeverity].replace(/[\d.]+\)$/, "0.1)") : "rgba(100, 220, 170, 0.06)"}`,
          borderRadius: 8,
          padding: "8px 10px",
        }}
      >
        {/* Header: ALERTS + count */}
        <div className="flex items-center justify-between mb-1">
          <span className="data-label" style={{ fontSize: "0.5rem" }}>Alerts</span>
          <span
            className="font-mono"
            style={{
              fontSize: "clamp(9px, 0.6vw, 11px)",
              color: hasAlerts ? SEVERITY_COLORS[highestSeverity] : "rgba(100, 220, 170, 0.7)",
              backgroundColor: hasAlerts ? SEVERITY_COLORS[highestSeverity].replace(/[\d.]+\)$/, "0.1)") : "rgba(100, 220, 170, 0.06)",
              padding: "1px 6px",
              borderRadius: 8,
            }}
          >
            {sw.alerts.length}
          </span>
        </div>

        {/* Alert display */}
        {hasAlerts ? (
          <AlertDisplay
            alert={sw.alerts[alertIdx % sw.alerts.length]}
            fadeIn={fadeIn}
          />
        ) : (
          <div className="flex-1 flex items-center gap-2">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "rgba(100, 220, 170, 0.7)",
                boxShadow: "0 0 4px rgba(100, 220, 170, 0.3)",
                flexShrink: 0,
              }}
            />
            <span
              className="font-body"
              style={{
                color: "rgba(100, 220, 170, 0.6)",
                fontSize: "clamp(10px, 0.75vw, 12px)",
                fontStyle: "italic",
              }}
            >
              No active alerts
            </span>
          </div>
        )}

        {/* Carousel dots */}
        {sw.alerts.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-1">
            {sw.alerts.map((_, i) => (
              <div
                key={i}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i === alertIdx % sw.alerts.length
                    ? SEVERITY_COLORS[highestSeverity]
                    : "rgba(200, 196, 220, 0.15)",
                  transition: "background 0.5s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Panel>
  );
});

function DataRow({
  label,
  value,
  unit,
  suffix,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  suffix?: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col">
      <span className="data-label" style={{ fontSize: "0.5rem" }}>{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono"
          style={{
            fontSize: "clamp(13px, 0.9vw, 16px)",
            fontWeight: 300,
            color: color || "var(--text-primary)",
          }}
        >
          {value}
        </span>
        {unit && <span className="data-label" style={{ fontSize: "0.45rem" }}>{unit}</span>}
        {suffix && (
          <span
            className="font-mono"
            style={{
              fontSize: "clamp(10px, 0.7vw, 12px)",
              color: color || "var(--moonsilver)",
              opacity: 0.6,
            }}
          >
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
