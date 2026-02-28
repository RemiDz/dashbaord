"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
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

  return (
    <Panel
      className="flex flex-col"
      style={style}
      animationDelay={animationDelay}
      glowColor={
        highestSeverity === "red" || highestSeverity === "orange"
          ? SEVERITY_COLORS[highestSeverity]
          : undefined
      }
    >
      <span className="panel-label">Space Weather</span>

      {/* ── Alert section ── */}
      <div className="mt-2 flex-shrink-0">
        {hasAlerts ? (
          <div className="space-y-1.5">
            {sw.alerts.slice(0, 2).map((alert, i) => (
              <div
                key={i}
                className="rounded-md px-2.5 py-1.5"
                style={{
                  background: SEVERITY_COLORS[alert.severity].replace(
                    /[\d.]+\)$/,
                    "0.06)",
                  ),
                  borderLeft: `2px solid ${SEVERITY_COLORS[alert.severity]}`,
                }}
              >
                <p
                  className="font-body"
                  style={{
                    fontSize: "clamp(10px, 0.75vw, 12px)",
                    color: SEVERITY_COLORS[alert.severity],
                    fontWeight: 400,
                    lineHeight: 1.4,
                  }}
                >
                  {alert.type}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: "rgba(100, 220, 170, 0.7)",
                boxShadow: "0 0 6px rgba(100, 220, 170, 0.3)",
              }}
            />
            <span
              className="font-body"
              style={{
                color: "rgba(100, 220, 170, 0.7)",
                fontSize: "clamp(12px, 0.85vw, 14px)",
                fontStyle: "italic",
              }}
            >
              No active alerts
            </span>
          </div>
        )}
      </div>

      {/* ── NOAA Scales ── */}
      <div className="flex items-center gap-3 mt-3">
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
        className="w-full my-3"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* ── Data rows ── */}
      <div className="space-y-2.5 mt-auto">
        {/* Solar Wind Speed */}
        <DataRow
          label="Solar Wind"
          value={
            sw.solarWindSpeed !== null ? `${sw.solarWindSpeed}` : "—"
          }
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

        {/* Bz Component */}
        <DataRow
          label="Bz Component"
          value={sw.bzComponent !== null ? `${sw.bzComponent}` : "—"}
          unit="nT"
          suffix={
            sw.bzDirection === "south"
              ? "↓ South"
              : sw.bzDirection === "north"
                ? "↑ North"
                : undefined
          }
          color={getBzColor(sw.bzComponent, sw.bzDirection)}
        />

        {/* Proton Density */}
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
    <div className="flex items-baseline justify-between">
      <span className="data-label">{label}</span>
      <div className="flex items-baseline gap-1">
        <span
          className="font-mono"
          style={{
            fontSize: "clamp(14px, 1vw, 17px)",
            fontWeight: 300,
            color: color || "var(--text-primary)",
          }}
        >
          {value}
        </span>
        <span className="data-label">{unit}</span>
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
