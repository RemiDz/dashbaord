"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { useTidalData } from "@/hooks/useTidalData";

interface TidalPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

function formatEventTime(timeStr: string): string {
  // Handle both "YYYY-MM-DD HH:MM" (NOAA) and ISO formats
  try {
    const d = new Date(timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T") + "Z");
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr.slice(-5);
  }
}

function formatEventHeight(height: number): string {
  return `${height.toFixed(1)}m`;
}

export const TidalPanel = memo(function TidalPanel({ style, animationDelay }: TidalPanelProps) {
  const {
    hourly, location, currentHeight, rising,
    nextHigh, nextLow, prevHigh, prevLow,
    isLoading, error,
  } = useTidalData();

  const sparkData = hourly.map((p) => p.height);
  const hasData = currentHeight !== null;

  return (
    <Panel className="flex flex-col" style={style} animationDelay={animationDelay}>
      {/* Top row: header + current + badge + next high/low grid */}
      <div className="flex items-start justify-between">
        {/* Left: header + current value */}
        <div>
          <div className="flex items-center gap-3">
            <span className="panel-label">Tidal Intelligence</span>
            {hasData && (
              <span
                className="panel-label px-2 py-0.5 rounded-sm"
                style={{
                  color: rising ? "rgba(80, 180, 220, 0.9)" : "rgba(205, 170, 110, 0.7)",
                  backgroundColor: rising ? "rgba(80, 180, 220, 0.1)" : "rgba(205, 170, 110, 0.08)",
                  letterSpacing: "0.12em",
                }}
              >
                {rising ? "RISING" : "FALLING"}
              </span>
            )}
          </div>
          <div className="mt-2">
            {hasData ? (
              <>
                <span className="value-large" style={{ color: "var(--tidal-blue)" }}>
                  {currentHeight.toFixed(1)}
                </span>
                <span className="value-unit">m</span>
              </>
            ) : (
              <span className="value-large" style={{ color: "var(--text-brass-faint)" }}>
                {isLoading ? "—" : "--"}
              </span>
            )}
          </div>
        </div>

        {/* Right: 2×2 high/low grid */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-right">
          <TideCell
            label="Next High"
            time={nextHigh ? formatEventTime(nextHigh.time) : "—"}
            height={nextHigh ? formatEventHeight(nextHigh.height) : "—"}
          />
          <TideCell
            label="Next Low"
            time={nextLow ? formatEventTime(nextLow.time) : "—"}
            height={nextLow ? formatEventHeight(nextLow.height) : "—"}
          />
          <TideCell
            label="Prev High"
            time={prevHigh ? formatEventTime(prevHigh.time) : "—"}
            height={prevHigh ? formatEventHeight(prevHigh.height) : "—"}
          />
          <TideCell
            label="Prev Low"
            time={prevLow ? formatEventTime(prevLow.time) : "—"}
            height={prevLow ? formatEventHeight(prevLow.height) : "—"}
          />
        </div>
      </div>

      {/* Subtitle for loading/error */}
      {!hasData && (
        <p className="value-sub mt-1">
          {isLoading ? "Connecting..." : error ? "Awaiting data" : ""}
        </p>
      )}

      {/* Full-width sparkline */}
      <div className="mt-auto pt-3">
        {sparkData.length > 1 ? (
          <Sparkline data={sparkData} color="rgba(80, 180, 220, 0.9)" height={52} showArea />
        ) : (
          <div style={{ height: 52 }} />
        )}
      </div>

      {/* Location footer */}
      <p className="value-sub mt-1 text-[0.65rem]" style={{ color: "var(--text-brass-faint)" }}>
        {location}
      </p>
    </Panel>
  );
});

function TideCell({ label, time, height }: { label: string; time: string; height: string }) {
  return (
    <div>
      <p className="text-[0.5rem] uppercase tracking-wider" style={{ color: "var(--text-brass-faint)" }}>
        {label}
      </p>
      <p className="font-mono text-xs" style={{ color: "var(--tidal-blue)", fontWeight: 300 }}>
        {time}
        <span className="ml-1.5" style={{ color: "var(--text-brass-dim)" }}>{height}</span>
      </p>
    </div>
  );
}
