"use client";

import { memo, useEffect, useRef } from "react";
import { Panel } from "@/components/shared/Panel";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useWeather, type HourlyPoint } from "@/hooks/useWeather";

interface WeatherPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

/** Large styled weather icon — sized for readability */
function WeatherIcon({ icon, size = 48 }: { icon: string; size?: number }) {
  return (
    <span
      style={{ fontSize: size, lineHeight: 1, display: "block" }}
      role="img"
      aria-label="weather"
    >
      {icon}
    </span>
  );
}

/** Canvas-based hourly temperature chart */
function HourlyChart({ data }: { data: HourlyPoint[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, w, h);

      const pad = { top: 14, bottom: 18, left: 4, right: 4 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;

      const temps = data.map((d) => d.temp);
      const min = Math.min(...temps) - 0.5;
      const max = Math.max(...temps) + 0.5;
      const range = max - min || 1;

      function toX(i: number) {
        return pad.left + (i / (data.length - 1)) * plotW;
      }
      function toY(val: number) {
        return pad.top + plotH - ((val - min) / range) * plotH;
      }

      // Reference lines
      ctx!.save();
      ctx!.strokeStyle = "rgba(255, 255, 255, 0.04)";
      ctx!.lineWidth = 0.5;
      for (let i = 0; i <= 3; i++) {
        const val = min + (range * i) / 3;
        const y = toY(val);
        ctx!.beginPath();
        ctx!.moveTo(pad.left, y);
        ctx!.lineTo(w - pad.right, y);
        ctx!.stroke();
      }
      ctx!.restore();

      // Build smooth cardinal spline path
      const points: [number, number][] = data.map((_, i) => [toX(i), toY(temps[i])]);

      const path = new Path2D();
      path.moveTo(points[0][0], points[0][1]);
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];
        const cp1x = p1[0] + ((p2[0] - p0[0]) / 6);
        const cp1y = p1[1] + ((p2[1] - p0[1]) / 6);
        const cp2x = p2[0] - ((p3[0] - p1[0]) / 6);
        const cp2y = p2[1] - ((p3[1] - p1[1]) / 6);
        path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
      }

      // Area fill
      const areaPath = new Path2D();
      areaPath.addPath(path);
      areaPath.lineTo(points[points.length - 1][0], h - pad.bottom);
      areaPath.lineTo(points[0][0], h - pad.bottom);
      areaPath.closePath();

      const gradient = ctx!.createLinearGradient(0, pad.top, 0, h);
      gradient.addColorStop(0, "rgba(232, 201, 122, 0.3)");
      gradient.addColorStop(0.4, "rgba(232, 201, 122, 0.08)");
      gradient.addColorStop(1, "rgba(232, 201, 122, 0.0)");
      ctx!.fillStyle = gradient;
      ctx!.fill(areaPath);

      // Line stroke
      ctx!.save();
      ctx!.strokeStyle = "rgba(232, 201, 122, 0.7)";
      ctx!.lineWidth = 2;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx!.stroke(path);
      ctx!.restore();

      // Soft glow behind line
      ctx!.save();
      ctx!.strokeStyle = "rgba(232, 201, 122, 0.2)";
      ctx!.lineWidth = 4;
      ctx!.filter = "blur(3px)";
      ctx!.stroke(path);
      ctx!.restore();

      // Current hour glowing dot (first point)
      const cp = points[0];
      ctx!.save();
      ctx!.shadowColor = "rgba(232, 201, 122, 0.9)";
      ctx!.shadowBlur = 12;
      ctx!.beginPath();
      ctx!.arc(cp[0], cp[1], 4, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(232, 201, 122, 0.9)";
      ctx!.fill();
      ctx!.restore();
      ctx!.beginPath();
      ctx!.arc(cp[0], cp[1], 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx!.fill();

      // Hour labels along bottom — every 2-3 hours
      ctx!.save();
      ctx!.font = "9px var(--font-jetbrains), 'JetBrains Mono', monospace";
      ctx!.textAlign = "center";
      ctx!.fillStyle = "rgba(200, 196, 220, 0.35)";
      const labelEvery = data.length > 10 ? 3 : 2;
      for (let i = 0; i < data.length; i += labelEvery) {
        ctx!.fillText(data[i].hour, toX(i), h - 3);
      }
      // Always label the last point if not already labelled
      if ((data.length - 1) % labelEvery !== 0) {
        ctx!.fillText(data[data.length - 1].hour, toX(data.length - 1), h - 3);
      }
      ctx!.restore();

      // Temperature labels at min/max
      ctx!.save();
      ctx!.font = "9px var(--font-jetbrains), 'JetBrains Mono', monospace";
      ctx!.fillStyle = "rgba(232, 201, 122, 0.5)";
      const maxIdx = temps.indexOf(Math.max(...temps));
      const minIdx = temps.indexOf(Math.min(...temps));
      ctx!.textAlign = "center";
      ctx!.fillText(`${Math.round(temps[maxIdx])}°`, toX(maxIdx), toY(temps[maxIdx]) - 4);
      if (maxIdx !== minIdx) {
        ctx!.fillStyle = "rgba(200, 196, 220, 0.35)";
        ctx!.fillText(`${Math.round(temps[minIdx])}°`, toX(minIdx), toY(temps[minIdx]) + 12);
      }
      ctx!.restore();
    }

    draw();

    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [data]);

  return (
    <div ref={containerRef} className="w-full flex-1 min-h-0">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

export const WeatherPanel = memo(function WeatherPanel({ style, animationDelay }: WeatherPanelProps) {
  const { current, forecast, hourly, location, isLoading, error } = useWeather();
  const hasData = current !== null;

  return (
    <Panel className="flex flex-col" style={style} animationDelay={animationDelay}>
      {/* Header: label + location */}
      <div className="flex items-center justify-between mb-2">
        <span className="panel-label">Weather</span>
        {location && (
          <span
            className="font-body tracking-wide"
            style={{
              color: "var(--moonsilver)",
              opacity: 0.6,
              fontSize: "clamp(0.7rem, 0.85vw, 0.9rem)",
            }}
          >
            {location}
          </span>
        )}
      </div>

      {/* ── Current Conditions ── */}
      <div className="flex items-start gap-4">
        {/* Left: Icon + Hero Temperature */}
        <div className="flex items-center gap-3">
          <WeatherIcon icon={hasData ? current.icon : "☁️"} size={56} />
          <div>
            {/* Hero temperature — 50px+ */}
            <div className="flex items-baseline">
              {hasData ? (
                <AnimatedValue
                  value={`${current.temp}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(50px, 4.5vw, 64px)",
                    fontWeight: 300,
                    letterSpacing: "-1px",
                    lineHeight: 1,
                    color: "var(--text-primary)",
                  }}
                />
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(50px, 4.5vw, 64px)",
                    fontWeight: 300,
                    color: "var(--text-dim)",
                  }}
                >
                  —
                </span>
              )}
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "clamp(20px, 1.8vw, 26px)",
                  fontWeight: 300,
                  color: "var(--moonsilver)",
                  opacity: 0.4,
                  marginLeft: "4px",
                }}
              >
                °C
              </span>
            </div>
            {/* Condition text */}
            <p
              className="font-body"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(14px, 1.1vw, 18px)",
                fontWeight: 300,
                marginTop: 2,
              }}
            >
              {isLoading && !hasData
                ? "Connecting..."
                : error && !hasData
                  ? "Awaiting data"
                  : hasData
                    ? current.condition
                    : "—"}
            </p>
          </div>
        </div>

        {/* Right: Data columns */}
        <div className="ml-auto flex flex-col gap-1.5 text-right">
          {/* Humidity */}
          <div className="flex items-baseline justify-end gap-1">
            <span className="data-value" style={{ fontSize: "clamp(14px, 1.1vw, 18px)" }}>
              {hasData ? `${current.humidity}` : "—"}
            </span>
            <span className="data-label">% rh</span>
          </div>
          {/* Wind */}
          <div className="flex items-baseline justify-end gap-1">
            <span className="data-value" style={{ fontSize: "clamp(14px, 1.1vw, 18px)" }}>
              {hasData ? `${current.wind}` : "—"}
            </span>
            <span className="data-label">km/h</span>
          </div>
          {/* Pressure */}
          <div className="flex items-baseline justify-end gap-1">
            <span className="data-value" style={{ fontSize: "clamp(14px, 1.1vw, 18px)" }}>
              {hasData && current.pressure ? `${current.pressure}` : "—"}
            </span>
            <span className="data-label">hPa</span>
          </div>
        </div>
      </div>

      {/* ── Sunrise / Sunset ── */}
      {hasData && current.sunrise && (
        <div
          className="flex items-center justify-center gap-6 mt-3"
          style={{
            padding: "6px 0",
            borderTop: "1px solid rgba(200, 196, 220, 0.06)",
            borderBottom: "1px solid rgba(200, 196, 220, 0.06)",
          }}
        >
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 16, opacity: 0.7 }}>☀</span>
            <span
              className="font-mono"
              style={{
                color: "var(--lunar-gold)",
                opacity: 0.7,
                fontSize: "clamp(13px, 1vw, 15px)",
                fontWeight: 300,
              }}
            >
              {current.sunrise}
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 14,
              background: "rgba(200, 196, 220, 0.1)",
            }}
          />
          <div className="flex items-center gap-1.5">
            <span style={{ fontSize: 16, opacity: 0.5 }}>☽</span>
            <span
              className="font-mono"
              style={{
                color: "var(--moonsilver)",
                opacity: 0.5,
                fontSize: "clamp(13px, 1vw, 15px)",
                fontWeight: 300,
              }}
            >
              {current.sunset}
            </span>
          </div>
        </div>
      )}

      {/* ── Hourly Temperature Chart ── */}
      {hourly.length > 1 && (
        <HourlyChart data={hourly} />
      )}

      {/* ── 5-Day Forecast ── */}
      <div className="grid grid-cols-5 gap-1 mt-auto pt-2">
        {forecast.length > 0
          ? forecast.map((day, i) => {
              const isToday = i === 0;
              return (
                <div
                  key={day.day}
                  className="flex flex-col items-center gap-1 rounded-lg py-2 px-1"
                  style={{
                    background: isToday
                      ? "rgba(232, 201, 122, 0.06)"
                      : "transparent",
                    border: isToday
                      ? "1px solid rgba(232, 201, 122, 0.12)"
                      : "1px solid transparent",
                    opacity: isToday ? 1 : 0.7,
                  }}
                >
                  {/* Day name */}
                  <p
                    className="font-display uppercase tracking-wider"
                    style={{
                      fontSize: "clamp(10px, 0.7vw, 12px)",
                      fontWeight: 600,
                      color: isToday
                        ? "var(--lunar-gold)"
                        : "var(--moonsilver)",
                      opacity: isToday ? 0.9 : 0.5,
                    }}
                  >
                    {day.day}
                  </p>
                  {/* Icon */}
                  <WeatherIcon icon={day.icon} size={24} />
                  {/* High */}
                  <p
                    className="font-mono"
                    style={{
                      fontSize: "clamp(14px, 1vw, 16px)",
                      fontWeight: 300,
                      color: "var(--text-primary)",
                    }}
                  >
                    {day.high}°
                  </p>
                  {/* Low */}
                  <p
                    className="font-mono"
                    style={{
                      fontSize: "clamp(12px, 0.85vw, 14px)",
                      fontWeight: 300,
                      color: "var(--moonsilver)",
                      opacity: 0.4,
                    }}
                  >
                    {day.low}°
                  </p>
                </div>
              );
            })
          : [0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 py-2"
                style={{ opacity: 0.2 }}
              >
                <p className="data-label">—</p>
                <WeatherIcon icon="☁️" size={24} />
                <p className="data-value">—</p>
                <p className="data-label">—</p>
              </div>
            ))}
      </div>
    </Panel>
  );
});
