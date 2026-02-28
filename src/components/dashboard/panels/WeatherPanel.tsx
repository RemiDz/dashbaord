"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useWeather } from "@/hooks/useWeather";

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

export const WeatherPanel = memo(function WeatherPanel({ style, animationDelay }: WeatherPanelProps) {
  const { current, forecast, location, isLoading, error } = useWeather();
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

      {/* ── 5-Day Forecast ── */}
      <div className="grid grid-cols-5 gap-1 mt-auto pt-3">
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
