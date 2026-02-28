"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useTidalData } from "@/hooks/useTidalData";
import { useAirQuality } from "@/hooks/useAirQuality";
import { useWeather } from "@/hooks/useWeather";

interface TidalPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

function formatEventTime(timeStr: string): string {
  try {
    const d = new Date(
      timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T") + "Z",
    );
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr.slice(-5);
  }
}

// ── AQI helpers ──────────────────────────────────────────

function getAqiStatus(aqi: number): { label: string; color: string } {
  if (aqi <= 20) return { label: "Good", color: "rgba(80, 220, 120, 0.9)" };
  if (aqi <= 40) return { label: "Fair", color: "rgba(180, 220, 80, 0.9)" };
  if (aqi <= 60) return { label: "Moderate", color: "rgba(240, 200, 60, 0.9)" };
  if (aqi <= 80) return { label: "Poor", color: "rgba(255, 150, 60, 0.9)" };
  if (aqi <= 100) return { label: "Very Poor", color: "rgba(255, 70, 50, 0.9)" };
  return { label: "Hazardous", color: "rgba(180, 30, 30, 0.9)" };
}

function getPollutantColor(value: number | null, thresholds: number[]): string {
  if (value === null) return "rgba(200, 196, 220, 0.3)";
  if (value <= thresholds[0]) return "rgba(80, 220, 120, 0.8)";
  if (value <= thresholds[1]) return "rgba(180, 220, 80, 0.8)";
  if (value <= thresholds[2]) return "rgba(240, 200, 60, 0.8)";
  if (value <= thresholds[3]) return "rgba(255, 150, 60, 0.8)";
  return "rgba(255, 70, 50, 0.8)";
}

/** SVG semicircular AQI gauge */
function AqiGauge({ aqi }: { aqi: number | null }) {
  const size = 120;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = 46;
  const strokeWidth = 8;

  // Arc from 180° to 0° (left to right semicircle)
  const startAngle = Math.PI;
  const endAngle = 0;

  // Clamp AQI 0-120 for gauge position
  const clampedAqi = Math.min(120, Math.max(0, aqi ?? 0));
  const fraction = clampedAqi / 120;
  const needleAngle = startAngle - fraction * Math.PI;
  const needleX = cx + r * Math.cos(needleAngle);
  const needleY = cy - r * Math.sin(needleAngle);

  // Arc path for background track
  const arcStartX = cx + r * Math.cos(startAngle);
  const arcStartY = cy - r * Math.sin(startAngle);
  const arcEndX = cx + r * Math.cos(endAngle);
  const arcEndY = cy - r * Math.sin(endAngle);
  const arcPath = `M ${arcStartX} ${arcStartY} A ${r} ${r} 0 0 1 ${arcEndX} ${arcEndY}`;

  const status = aqi !== null ? getAqiStatus(aqi) : null;

  return (
    <div style={{ position: "relative", width: size, height: size / 2 + 18 }}>
      <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
        {/* Gradient definition */}
        <defs>
          <linearGradient id="aqiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(80, 220, 120, 0.8)" />
            <stop offset="25%" stopColor="rgba(180, 220, 80, 0.8)" />
            <stop offset="50%" stopColor="rgba(240, 200, 60, 0.8)" />
            <stop offset="75%" stopColor="rgba(255, 150, 60, 0.8)" />
            <stop offset="100%" stopColor="rgba(255, 70, 50, 0.8)" />
          </linearGradient>
        </defs>

        {/* Background track (dim) */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(200, 196, 220, 0.06)"
          strokeWidth={strokeWidth + 2}
          strokeLinecap="round"
        />

        {/* Coloured arc */}
        <path
          d={arcPath}
          fill="none"
          stroke="url(#aqiGrad)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Needle dot */}
        {aqi !== null && (
          <>
            <circle
              cx={needleX}
              cy={needleY}
              r={5}
              fill={status?.color ?? "#fff"}
              opacity={0.9}
            />
            <circle
              cx={needleX}
              cy={needleY}
              r={8}
              fill={status?.color ?? "#fff"}
              opacity={0.2}
            />
          </>
        )}
      </svg>

      {/* Centre number + status */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          textAlign: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(22px, 2vw, 30px)",
            fontWeight: 300,
            color: status?.color ?? "var(--text-dim)",
            lineHeight: 1,
          }}
        >
          {aqi !== null ? aqi : "—"}
        </span>
        {status && (
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(11px, 0.85vw, 14px)",
              fontWeight: 400,
              color: status.color,
              opacity: 0.85,
              marginTop: 1,
            }}
          >
            {status.label}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Wave animation (shorter version) ────────────────────

function wavePath(
  width: number,
  amplitude: number,
  frequency: number,
  phaseOffset: number,
): string {
  const points: string[] = [];
  const totalWidth = width * 2;
  const steps = 120;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * totalWidth;
    const y =
      amplitude * Math.sin((i / steps) * Math.PI * 2 * frequency + phaseOffset);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  points.push(`L${totalWidth},${amplitude + 20}`);
  points.push(`L0,${amplitude + 20}`);
  points.push("Z");

  return points.join(" ");
}

function WaterAnimation({
  rising,
  waterLevel,
}: {
  rising: boolean;
  waterLevel: number;
}) {
  const width = 600;
  const viewHeight = 50; // shorter than before
  const levelOffset = (1 - waterLevel) * 20;

  const layers = [
    { amplitude: 4, frequency: 2, phase: 0, opacity: 0.12, color: "rgba(80, 180, 230, 1)", duration: 8, yOffset: levelOffset + 8 },
    { amplitude: 3, frequency: 2.5, phase: 1.2, opacity: 0.18, color: "rgba(60, 150, 210, 1)", duration: 6, yOffset: levelOffset + 4 },
    { amplitude: 2, frequency: 3, phase: 2.4, opacity: 0.25, color: "rgba(40, 120, 200, 1)", duration: 4.5, yOffset: levelOffset },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: viewHeight,
        overflow: "hidden",
        borderRadius: "0 0 16px 16px",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.max(8, viewHeight - levelOffset - 6),
          background: "linear-gradient(180deg, rgba(20, 60, 120, 0.08) 0%, rgba(10, 40, 100, 0.15) 100%)",
          transition: "height 3s ease",
        }}
      />
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: width * 2,
            height: viewHeight,
            animation: `waveSlide${i + 1} ${layer.duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          <svg
            width={width * 2}
            height={viewHeight}
            viewBox={`0 -${layer.amplitude + 2} ${width * 2} ${viewHeight}`}
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <path
              d={wavePath(width, layer.amplitude, layer.frequency, layer.phase)}
              fill={layer.color}
              fillOpacity={layer.opacity}
              style={{
                transform: `translateY(${layer.yOffset}px)`,
                transition: "transform 3s ease",
              }}
            />
          </svg>
        </div>
      ))}
      {rising && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100%",
            background: "linear-gradient(180deg, rgba(80, 180, 230, 0.04) 0%, rgba(80, 180, 230, 0.08) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────

export const TidalPanel = memo(function TidalPanel({
  style,
  animationDelay,
}: TidalPanelProps) {
  const air = useAirQuality();
  const { location } = useWeather();
  const {
    hourly,
    location: tidalLocation,
    currentHeight,
    rising,
    nextHigh,
    nextLow,
    isLoading,
    error,
  } = useTidalData();

  const sparkData = hourly.map((p) => p.height);
  const hasData = currentHeight !== null;

  let waterLevel = 0.5;
  if (hasData && sparkData.length > 1) {
    const min = Math.min(...sparkData);
    const max = Math.max(...sparkData);
    const range = max - min;
    waterLevel = range > 0 ? (currentHeight - min) / range : 0.5;
  }

  return (
    <Panel
      className="flex flex-col relative overflow-hidden"
      style={style}
      animationDelay={animationDelay}
    >
      {/* ═══ TOP HALF: Air Quality ═══ */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="panel-label">Air Quality</span>
          {location && (
            <span
              className="font-body"
              style={{
                color: "var(--moonsilver)",
                opacity: 0.4,
                fontSize: "clamp(9px, 0.7vw, 11px)",
              }}
            >
              {location}
            </span>
          )}
        </div>

        {/* Gauge + pollutants */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <AqiGauge aqi={air.aqi} />

          {/* Pollutant row */}
          <div
            className="flex justify-center gap-3 mt-1"
            style={{ width: "100%" }}
          >
            {([
              { label: "PM2.5", value: air.pm25, unit: "", thresholds: [10, 25, 50, 75] },
              { label: "PM10", value: air.pm10, unit: "", thresholds: [20, 50, 100, 200] },
              { label: "NO\u2082", value: air.no2, unit: "", thresholds: [40, 90, 120, 230] },
              { label: "O\u2083", value: air.o3, unit: "", thresholds: [60, 100, 140, 180] },
            ] as const).map((p) => (
              <div key={p.label} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: getPollutantColor(p.value, [...p.thresholds]),
                      display: "inline-block",
                    }}
                  />
                  <span
                    className="data-label"
                    style={{ fontSize: "clamp(7px, 0.55vw, 9px)" }}
                  >
                    {p.label}
                  </span>
                </div>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "clamp(10px, 0.75vw, 13px)",
                    fontWeight: 300,
                    color: "rgba(240, 238, 248, 0.65)",
                  }}
                >
                  {p.value !== null ? Math.round(p.value) : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ Glass divider ═══ */}
      <div
        className="w-full relative z-10"
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
          margin: "4px 0",
        }}
      />

      {/* ═══ BOTTOM HALF: Tidal Intelligence (compact) ═══ */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header with badge */}
        <div className="flex items-center justify-between">
          <span className="panel-label">Tidal</span>
          {hasData && (
            <span
              className="status-badge inline-flex items-center gap-1"
              style={{
                color: rising ? "var(--accent-tidal)" : "var(--text-secondary)",
                backgroundColor: rising ? "rgba(80, 180, 230, 0.1)" : "rgba(200, 196, 220, 0.08)",
                padding: "2px 8px",
                fontSize: "clamp(8px, 0.6vw, 10px)",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  animation: rising ? "tideArrow 1.5s ease-in-out infinite" : "tideArrowDown 1.5s ease-in-out infinite",
                  fontSize: "clamp(10px, 0.75vw, 12px)",
                }}
              >
                {rising ? "▲" : "▼"}
              </span>
              {rising ? "RISING" : "FALLING"}
            </span>
          )}
        </div>

        {/* Compact tide data row */}
        <div className="flex items-baseline gap-3 mt-1">
          {hasData ? (
            <>
              <AnimatedValue
                value={currentHeight.toFixed(1)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(24px, 2.2vw, 32px)",
                  fontWeight: 300,
                  color: "var(--accent-tidal)",
                  lineHeight: 1,
                }}
              />
              <span
                className="font-body"
                style={{
                  fontSize: "clamp(12px, 0.9vw, 15px)",
                  color: "var(--moonsilver)",
                  opacity: 0.4,
                }}
              >
                m
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(24px, 2.2vw, 32px)",
                color: "var(--text-dim)",
              }}
            >
              {isLoading ? "—" : "--"}
            </span>
          )}

          {/* Next high/low inline */}
          <div className="ml-auto flex gap-3">
            <div>
              <p className="data-label" style={{ fontSize: "clamp(7px, 0.5vw, 8px)" }}>High</p>
              <p className="font-mono" style={{ fontSize: "clamp(11px, 0.8vw, 13px)", color: "rgba(240, 238, 248, 0.65)" }}>
                {nextHigh ? formatEventTime(nextHigh.time) : "—"}
              </p>
            </div>
            <div>
              <p className="data-label" style={{ fontSize: "clamp(7px, 0.5vw, 8px)" }}>Low</p>
              <p className="font-mono" style={{ fontSize: "clamp(11px, 0.8vw, 13px)", color: "rgba(240, 238, 248, 0.65)" }}>
                {nextLow ? formatEventTime(nextLow.time) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Sparkline */}
        <div className="mt-auto pt-1">
          {sparkData.length > 1 ? (
            <Sparkline
              data={sparkData}
              color="rgba(80, 180, 230, 0.9)"
              height={36}
              showArea
              pulseEndpoint
              referenceLines={2}
            />
          ) : (
            <div style={{ height: 36 }} />
          )}
        </div>

        {!hasData && error && (
          <p className="font-body" style={{ color: "var(--text-dim)", fontSize: "0.7rem" }}>
            Awaiting data
          </p>
        )}
        <p className="data-label mt-0.5" style={{ fontSize: "clamp(7px, 0.5vw, 9px)" }}>
          {tidalLocation}
        </p>
      </div>

      {/* Water animation */}
      <WaterAnimation rising={rising} waterLevel={waterLevel} />
    </Panel>
  );
});
