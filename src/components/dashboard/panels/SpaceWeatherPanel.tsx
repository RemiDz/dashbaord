"use client";

import { memo } from "react";
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

  const tickerText = hasAlerts
    ? sw.alerts.map((a) => a.type).join("  ●  ")
    : "No active space weather alerts";
  const tickerColor = hasAlerts
    ? SEVERITY_COLORS[highestSeverity]
    : "rgba(100, 220, 170, 0.7)";
  const tickerBg = hasAlerts
    ? SEVERITY_COLORS[highestSeverity].replace(/[\d.]+\)$/, "0.06)")
    : "rgba(100, 220, 170, 0.03)";

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
        className="w-full my-3"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* ── Data grid — 2 columns ── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
        <div className="mt-3 flex-1 min-h-0">
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

      {/* ── Alert ticker at bottom ── */}
      <div
        style={{
          height: 30,
          marginTop: "auto",
          background: tickerBg,
          borderTop: `1px solid ${tickerColor.replace(/[\d.]+\)$/, "0.12)")}`,
          borderRadius: "0 0 14px 14px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          position: "relative",
          marginLeft: -16,
          marginRight: -16,
          marginBottom: -16,
          paddingLeft: 0,
          paddingRight: 0,
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
            animation: "tickerScroll 25s linear infinite",
            fontFamily: "var(--font-body)",
            fontSize: "clamp(10px, 0.75vw, 12px)",
            fontWeight: 400,
            color: tickerColor,
            paddingLeft: "100%",
          }}
        >
          {tickerText}
        </div>
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
