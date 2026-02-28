"use client";

import { memo, useEffect, useRef } from "react";
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
  if (value === null) return "rgba(200, 196, 220, 0.2)";
  if (value <= thresholds[0]) return "rgba(80, 220, 120, 0.5)";
  if (value <= thresholds[1]) return "rgba(180, 220, 80, 0.5)";
  if (value <= thresholds[2]) return "rgba(240, 200, 60, 0.5)";
  if (value <= thresholds[3]) return "rgba(255, 150, 60, 0.5)";
  return "rgba(255, 70, 50, 0.5)";
}

/** Minimal horizontal AQI bar with position marker */
function AqiBar({ aqi }: { aqi: number | null }) {
  const status = aqi !== null ? getAqiStatus(aqi) : null;
  // Position: clamp to 0–120, map to 0–100%
  const pct = aqi !== null ? Math.min(100, Math.max(0, (Math.min(aqi, 120) / 120) * 100)) : 0;

  return (
    <div style={{ width: "100%" }}>
      {/* AQI number + status word */}
      <div className="flex items-baseline gap-2 mb-2">
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "clamp(32px, 2.8vw, 44px)",
            fontWeight: 300,
            color: status?.color ?? "var(--text-dim)",
            lineHeight: 1,
          }}
        >
          {aqi !== null ? aqi : "—"}
        </span>
        {status && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "clamp(14px, 1.1vw, 18px)",
              fontWeight: 400,
              color: status.color,
              opacity: 0.7,
            }}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Gradient bar */}
      <div style={{ position: "relative", width: "100%", padding: "0 3px" }}>
        <div
          style={{
            width: "100%",
            height: 4,
            borderRadius: 3,
            background: "linear-gradient(90deg, rgba(80, 220, 120, 0.32), rgba(180, 220, 80, 0.32), rgba(240, 200, 60, 0.32), rgba(255, 150, 60, 0.32), rgba(255, 70, 50, 0.32))",
          }}
        />
        {/* Position marker */}
        {aqi !== null && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: `${pct}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: "50%",
                backgroundColor: status?.color ?? "#fff",
                boxShadow: `0 0 6px ${status?.color ?? "#fff"}, 0 0 12px ${status?.color ?? "#fff"}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Scale labels */}
      <div
        className="flex justify-between"
        style={{
          fontSize: "clamp(7px, 0.5vw, 9px)",
          color: "rgba(200, 196, 220, 0.3)",
          fontFamily: "var(--font-mono)",
          marginTop: 2,
          padding: "0 1px",
        }}
      >
        <span>0</span>
        <span>100+</span>
      </div>
    </div>
  );
}

// ── Tidal chart with H/L reference lines + NOW marker ───

interface TidalChartProps {
  hourly: { time: string; height: number }[];
  nextHigh: { time: string; height: number } | null;
  nextLow: { time: string; height: number } | null;
  height?: number;
}

function TidalChart({ hourly, nextHigh, nextLow, height = 60 }: TidalChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || hourly.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const color = "rgba(80, 180, 230, 0.9)";

    // Pre-compute static data
    const heights = hourly.map((p) => p.height);
    const min = Math.min(...heights);
    const max = Math.max(...heights);
    const range = max - min || 1;
    const times = hourly.map((p) => new Date(p.time).getTime());

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = height;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pad = { top: 14, bottom: 18, left: 0, right: 28 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;

      function toX(i: number) {
        return pad.left + (i / (hourly.length - 1)) * plotW;
      }
      function toY(val: number) {
        return pad.top + plotH - ((val - min) / range) * plotH;
      }

      ctx!.clearRect(0, 0, w, h);

      // --- Find NOW position ---
      const now = Date.now();
      let nowIdx = -1;
      for (let i = 0; i < times.length - 1; i++) {
        if (now >= times[i] && now <= times[i + 1]) {
          nowIdx = i + (now - times[i]) / (times[i + 1] - times[i]);
          break;
        }
      }
      if (nowIdx < 0 && times.length > 0 && now >= times[times.length - 1]) {
        nowIdx = times.length - 1;
      }

      let nowY = h;
      if (nowIdx >= 0) {
        const iLow = Math.floor(nowIdx);
        const iHigh = Math.min(iLow + 1, heights.length - 1);
        const frac = nowIdx - iLow;
        const nowVal = heights[iLow] + (heights[iHigh] - heights[iLow]) * frac;
        nowY = toY(nowVal);
      }

      // --- Water fill from current tide level to bottom ---
      const t = Date.now() / 1000;
      const waterGrad = ctx!.createLinearGradient(0, nowY, 0, h);
      waterGrad.addColorStop(0, "rgba(40, 120, 200, 0.18)");
      waterGrad.addColorStop(0.3, "rgba(30, 100, 180, 0.12)");
      waterGrad.addColorStop(1, "rgba(20, 70, 150, 0.06)");
      ctx!.fillStyle = waterGrad;
      ctx!.fillRect(pad.left, nowY, plotW, h - nowY);

      // Animated wave ripples at water surface
      ctx!.save();
      ctx!.beginPath();
      ctx!.moveTo(pad.left, nowY);
      for (let x = pad.left; x <= pad.left + plotW; x += 2) {
        const wave1 = Math.sin((x * 0.04) + t * 1.2) * 2;
        const wave2 = Math.sin((x * 0.07) + t * 0.8 + 1.5) * 1.2;
        ctx!.lineTo(x, nowY + wave1 + wave2);
      }
      ctx!.lineTo(pad.left + plotW, h);
      ctx!.lineTo(pad.left, h);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(80, 180, 230, 0.08)";
      ctx!.fill();
      ctx!.restore();

      // --- H/L dashed reference lines ---
      const highY = toY(max);
      const lowY = toY(min);

      ctx!.save();
      ctx!.setLineDash([3, 3]);
      ctx!.lineWidth = 0.8;

      ctx!.strokeStyle = "rgba(255, 255, 255, 0.15)";
      ctx!.beginPath();
      ctx!.moveTo(pad.left, highY);
      ctx!.lineTo(w - pad.right, highY);
      ctx!.stroke();

      ctx!.beginPath();
      ctx!.moveTo(pad.left, lowY);
      ctx!.lineTo(w - pad.right, lowY);
      ctx!.stroke();
      ctx!.restore();

      // H/L labels on right edge
      ctx!.save();
      ctx!.font = "10px var(--font-mono, monospace)";
      ctx!.textAlign = "left";
      ctx!.fillStyle = "rgba(200, 196, 220, 0.4)";
      ctx!.fillText(`H`, w - pad.right + 5, highY + 4);
      ctx!.fillText(`L`, w - pad.right + 5, lowY + 4);

      ctx!.font = "8px var(--font-mono, monospace)";
      ctx!.fillStyle = "rgba(200, 196, 220, 0.3)";
      ctx!.fillText(`${max.toFixed(1)}`, w - pad.right + 5, highY - 5);
      ctx!.fillText(`${min.toFixed(1)}`, w - pad.right + 5, lowY + 14);
      ctx!.restore();

      // --- Build smooth path using cardinal spline ---
      const points: [number, number][] = heights.map((v, i) => [toX(i), toY(v)]);

      function cardinalSpline(pts: [number, number][], tension: number) {
        const path = new Path2D();
        if (pts.length < 2) return path;
        path.moveTo(pts[0][0], pts[0][1]);
        if (pts.length === 2) {
          path.lineTo(pts[1][0], pts[1][1]);
          return path;
        }
        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i === 0 ? 0 : i - 1];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];
          const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
          const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
          const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
          const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;
          path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
        }
        return path;
      }

      const linePath = cardinalSpline(points, 1);

      // --- Area fill under curve ---
      const areaPath = new Path2D();
      areaPath.addPath(linePath);
      areaPath.lineTo(points[points.length - 1][0], h);
      areaPath.lineTo(points[0][0], h);
      areaPath.closePath();

      const gradient = ctx!.createLinearGradient(0, pad.top, 0, h);
      gradient.addColorStop(0, "rgba(80, 180, 230, 0.25)");
      gradient.addColorStop(0.4, "rgba(80, 180, 230, 0.08)");
      gradient.addColorStop(1, "rgba(80, 180, 230, 0.0)");
      ctx!.fillStyle = gradient;
      ctx!.fill(areaPath);

      // --- Line stroke ---
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 2.5;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx!.stroke(linePath);

      // --- NOW indicator ---
      if (nowIdx >= 0) {
        const nowX = pad.left + (nowIdx / (hourly.length - 1)) * plotW;

        // Vertical dashed line
        ctx!.save();
        ctx!.setLineDash([2, 3]);
        ctx!.strokeStyle = "rgba(255, 255, 255, 0.12)";
        ctx!.lineWidth = 0.8;
        ctx!.beginPath();
        ctx!.moveTo(nowX, pad.top);
        ctx!.lineTo(nowX, h - pad.bottom);
        ctx!.stroke();
        ctx!.restore();

        // Glowing dot at current position
        ctx!.save();
        ctx!.shadowColor = color;
        ctx!.shadowBlur = 14;
        ctx!.beginPath();
        ctx!.arc(nowX, nowY, 5, 0, Math.PI * 2);
        ctx!.fillStyle = color;
        ctx!.fill();
        ctx!.restore();

        // Inner bright core
        ctx!.beginPath();
        ctx!.arc(nowX, nowY, 2.2, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(255, 255, 255, 0.9)";
        ctx!.fill();
      }

      // --- High/Low time labels on chart peaks/troughs ---
      if (nextHigh) {
        const ht = new Date(nextHigh.time).getTime();
        for (let i = 0; i < times.length; i++) {
          if (Math.abs(times[i] - ht) < 3600000) {
            const hx = toX(i);
            const hy = toY(heights[i]);
            ctx!.save();
            ctx!.font = "9px var(--font-mono, monospace)";
            ctx!.textAlign = "center";
            ctx!.fillStyle = "rgba(200, 196, 220, 0.45)";
            ctx!.fillText(formatEventTime(nextHigh.time), hx, hy - 6);
            ctx!.restore();
            break;
          }
        }
      }
      if (nextLow) {
        const lt = new Date(nextLow.time).getTime();
        for (let i = 0; i < times.length; i++) {
          if (Math.abs(times[i] - lt) < 3600000) {
            const lx = toX(i);
            const ly = toY(heights[i]);
            ctx!.save();
            ctx!.font = "9px var(--font-mono, monospace)";
            ctx!.textAlign = "center";
            ctx!.fillStyle = "rgba(200, 196, 220, 0.45)";
            ctx!.fillText(formatEventTime(nextLow.time), lx, ly + 13);
            ctx!.restore();
            break;
          }
        }
      }
    }

    // Animate the water ripples
    function loop() {
      draw();
      animRef.current = requestAnimationFrame(loop);
    }
    loop();

    const observer = new ResizeObserver(() => draw());
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [hourly, nextHigh, nextLow, height]);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="block" />
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

  const hasData = currentHeight !== null;

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

        {/* AQI display + bar + pollutants */}
        <div className="flex-1 flex flex-col justify-center">
          <AqiBar aqi={air.aqi} />

          {/* 24H AQI trend sparkline */}
          {air.hourlyAqi.length > 1 && (
            <div className="mt-1">
              <Sparkline
                data={air.hourlyAqi}
                color="rgba(120, 180, 255, 0.7)"
                height={50}
                showArea
                pulseEndpoint
              />
              <p
                className="data-label"
                style={{
                  fontSize: "clamp(6px, 0.45vw, 8px)",
                  marginTop: 1,
                  textAlign: "center",
                }}
              >
                24H AQI Trend
              </p>
            </div>
          )}

          {/* Pollutant row — single compact line */}
          <div
            className="flex justify-between mt-2"
            style={{ width: "100%" }}
          >
            {([
              { label: "PM2.5", value: air.pm25, thresholds: [10, 25, 50, 75] },
              { label: "PM10", value: air.pm10, thresholds: [20, 50, 100, 200] },
              { label: "NO\u2082", value: air.no2, thresholds: [40, 90, 120, 230] },
              { label: "O\u2083", value: air.o3, thresholds: [60, 100, 140, 180] },
            ] as const).map((p) => (
              <div key={p.label} className="flex items-center gap-1">
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    backgroundColor: getPollutantColor(p.value, [...p.thresholds]),
                    display: "inline-block",
                    flexShrink: 0,
                  }}
                />
                <span
                  className="data-label"
                  style={{ fontSize: "clamp(7px, 0.55vw, 9px)" }}
                >
                  {p.label}
                </span>
                <span
                  className="font-mono"
                  style={{
                    fontSize: "clamp(10px, 0.75vw, 13px)",
                    fontWeight: 300,
                    color: "rgba(240, 238, 248, 0.38)",
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
          background: "linear-gradient(90deg, transparent 5%, rgba(200, 196, 220, 0.18) 30%, rgba(200, 196, 220, 0.22) 50%, rgba(200, 196, 220, 0.18) 70%, transparent 95%)",
          margin: "14px 0",
        }}
      />

      {/* ═══ BOTTOM HALF: Tidal Intelligence (compact) ═══ */}
      <div className="flex-1 flex flex-col min-h-0 relative z-10">
        {/* Header: TIDAL ▲ RISING on one line */}
        <div className="flex items-center gap-2">
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

        {/* Current height */}
        <div className="flex items-baseline gap-2 mt-1">
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
        </div>

        {/* Tidal chart with H/L reference lines and NOW marker */}
        <div className="flex-1 min-h-0 pt-1">
          {hourly.length > 1 ? (
            <TidalChart
              hourly={hourly}
              nextHigh={nextHigh}
              nextLow={nextLow}
              height={90}
            />
          ) : (
            <div style={{ height: 90 }} />
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
    </Panel>
  );
});
