"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useWeather } from "@/hooks/useWeather";

interface WeatherPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const WeatherPanel = memo(function WeatherPanel({ style, animationDelay }: WeatherPanelProps) {
  const { current, forecast, location, isLoading, error } = useWeather();

  const hasData = current !== null;

  return (
    <Panel className="flex flex-col" style={style} animationDelay={animationDelay}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="panel-label">Weather</span>
        {location && (
          <span className="data-label">{location}</span>
        )}
      </div>

      {/* Current conditions — hero layout */}
      <div className="flex items-start justify-between mt-3">
        <div className="flex items-center gap-4">
          {/* Larger condition icon */}
          <span style={{ fontSize: "clamp(36px, 3.5vw, 52px)", lineHeight: 1 }}>
            {hasData ? current.icon : "\u2601\uFE0F"}
          </span>
          <div>
            {/* Hero temperature */}
            <div className="flex items-baseline">
              {hasData ? (
                <AnimatedValue
                  value={`${current.temp}`}
                  className="value-large"
                />
              ) : (
                <span className="value-large" style={{ color: "var(--text-dim)" }}>—</span>
              )}
              <span className="value-unit">°C</span>
            </div>
            <p className="value-sub mt-0.5">
              {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : hasData ? current.condition : "—"}
            </p>
          </div>
        </div>

        {/* Humidity + wind + sun times */}
        <div className="text-right">
          <p className="data-value">{hasData ? `${current.humidity}%` : "—"}<span className="data-label ml-1">rh</span></p>
          <p className="data-value mt-1">{hasData ? `${current.wind}` : "—"}<span className="data-label ml-1">km/h</span></p>
          {hasData && current.sunrise && (
            <div className="mt-2 flex flex-col gap-0.5">
              <p className="data-label" style={{ fontSize: "clamp(9px, 0.6vw, 11px)" }}>
                ☀ {current.sunrise}
                <span className="ml-2">☾ {current.sunset}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div
        className="w-full my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* 4-day forecast */}
      <div className="grid grid-cols-4 gap-2 mt-auto">
        {forecast.length > 0
          ? forecast.map((day, i) => (
              <div
                key={day.day}
                className="flex flex-col items-center gap-1"
                style={{ opacity: i === 0 ? 1 : 0.65 }}
              >
                <p className="data-label" style={i === 0 ? { color: "var(--text-label)" } : undefined}>
                  {day.day}
                </p>
                <span style={{ fontSize: "clamp(18px, 1.4vw, 24px)", lineHeight: 1 }}>{day.icon}</span>
                <p className="data-value">{day.high}°</p>
                <p className="data-label" style={{ fontSize: "clamp(10px, 0.7vw, 13px)" }}>{day.low}°</p>
              </div>
            ))
          : [0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1" style={{ opacity: 0.3 }}>
                <p className="data-label">—</p>
                <span style={{ fontSize: "clamp(18px, 1.4vw, 24px)", lineHeight: 1 }}>{"\u2601\uFE0F"}</span>
                <p className="data-value">—</p>
                <p className="data-label">—</p>
              </div>
            ))}
      </div>
    </Panel>
  );
});
