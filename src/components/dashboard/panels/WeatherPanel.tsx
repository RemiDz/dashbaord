"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
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
          <span
            className="text-[0.55rem] uppercase tracking-wider"
            style={{ color: "var(--text-brass-faint)" }}
          >
            {location}
          </span>
        )}
      </div>

      {/* Current conditions */}
      <div className="flex items-start justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl leading-none">{hasData ? current.icon : "\u2601\uFE0F"}</span>
          <div>
            <div className="flex items-baseline">
              <span className="value-large" style={!hasData ? { color: "var(--text-brass-faint)" } : undefined}>
                {hasData ? current.temp : "—"}
              </span>
              <span className="value-unit">°C</span>
            </div>
            <p className="value-sub mt-0.5">
              {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : hasData ? current.condition : "—"}
            </p>
          </div>
        </div>

        {/* Humidity + wind */}
        <div className="text-right">
          <p className="text-[0.65rem] font-mono" style={{ color: "var(--text-brass-dim)", fontWeight: 300 }}>
            {hasData ? `${current.humidity}% rh` : "—"}
          </p>
          <p className="text-[0.65rem] font-mono mt-0.5" style={{ color: "var(--text-brass-dim)", fontWeight: 300 }}>
            {hasData ? `${current.wind} km/h` : "—"}
          </p>
        </div>
      </div>

      {/* Sacred divider */}
      <div
        className="w-full my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(205,170,110,0.2), transparent)",
        }}
      />

      {/* 4-day forecast */}
      <div className="grid grid-cols-4 gap-1 mt-auto">
        {forecast.length > 0
          ? forecast.map((day, i) => (
              <div
                key={day.day}
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: i === 0 ? 1 : 0.65 }}
              >
                <p
                  className="text-[0.55rem] uppercase tracking-wider"
                  style={{ color: i === 0 ? "var(--text-brass)" : "var(--text-brass-dim)" }}
                >
                  {day.day}
                </p>
                <span className="text-sm leading-none">{day.icon}</span>
                <p className="font-mono text-[0.6rem]" style={{ color: "var(--text-value)", fontWeight: 300 }}>
                  {day.high}°
                </p>
                <p className="font-mono text-[0.6rem]" style={{ color: "var(--text-brass-faint)", fontWeight: 300 }}>
                  {day.low}°
                </p>
              </div>
            ))
          : [0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-0.5" style={{ opacity: 0.3 }}>
                <p className="text-[0.55rem] uppercase tracking-wider" style={{ color: "var(--text-brass-faint)" }}>—</p>
                <span className="text-sm leading-none">{"\u2601\uFE0F"}</span>
                <p className="font-mono text-[0.6rem]" style={{ color: "var(--text-brass-faint)" }}>—</p>
                <p className="font-mono text-[0.6rem]" style={{ color: "var(--text-brass-faint)" }}>—</p>
              </div>
            ))}
      </div>
    </Panel>
  );
});
