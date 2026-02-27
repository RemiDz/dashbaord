"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useTidalData } from "@/hooks/useTidalData";

interface TidalPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

function formatEventTime(timeStr: string): string {
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
      {/* Top row */}
      <div className="flex items-start justify-between">
        {/* Left: header + current */}
        <div>
          <div className="flex items-center gap-3">
            <span className="panel-label">Tidal Intelligence</span>
            {hasData && (
              <span
                className="status-badge inline-flex items-center gap-1.5"
                style={{
                  color: rising ? "var(--accent-tidal)" : "var(--text-secondary)",
                  backgroundColor: rising ? "rgba(80, 180, 230, 0.1)" : "rgba(180, 200, 240, 0.08)",
                }}
              >
                {/* Animated arrow */}
                <span
                  style={{
                    display: "inline-block",
                    animation: rising ? "tideArrow 1.5s ease-in-out infinite" : "tideArrowDown 1.5s ease-in-out infinite",
                    fontSize: "clamp(12px, 0.9vw, 15px)",
                  }}
                >
                  {rising ? "▲" : "▼"}
                </span>
                {rising ? "RISING" : "FALLING"}
              </span>
            )}
          </div>
          <div className="mt-3">
            {hasData ? (
              <>
                <AnimatedValue
                  value={currentHeight.toFixed(1)}
                  className="value-large"
                  style={{ color: "var(--accent-tidal)" }}
                />
                <span className="value-unit">m</span>
              </>
            ) : (
              <span className="value-large" style={{ color: "var(--text-dim)" }}>
                {isLoading ? "—" : "--"}
              </span>
            )}
          </div>
        </div>

        {/* Right: 2×2 high/low grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-right">
          <TideCell label="Next High" time={nextHigh ? formatEventTime(nextHigh.time) : "—"} height={nextHigh ? formatEventHeight(nextHigh.height) : "—"} />
          <TideCell label="Next Low" time={nextLow ? formatEventTime(nextLow.time) : "—"} height={nextLow ? formatEventHeight(nextLow.height) : "—"} />
          <TideCell label="Prev High" time={prevHigh ? formatEventTime(prevHigh.time) : "—"} height={prevHigh ? formatEventHeight(prevHigh.height) : "—"} />
          <TideCell label="Prev Low" time={prevLow ? formatEventTime(prevLow.time) : "—"} height={prevLow ? formatEventHeight(prevLow.height) : "—"} />
        </div>
      </div>

      {!hasData && (
        <p className="value-sub mt-1">
          {isLoading ? "Connecting..." : error ? "Awaiting data" : ""}
        </p>
      )}

      {/* Sparkline — oceanic feel with pulse endpoint */}
      <div className="mt-auto pt-4">
        {sparkData.length > 1 ? (
          <Sparkline
            data={sparkData}
            color="rgba(80, 180, 230, 0.9)"
            height={100}
            showArea
            pulseEndpoint
            referenceLines={2}
          />
        ) : (
          <div style={{ height: 100 }} />
        )}
      </div>

      <p className="data-label mt-2">{location}</p>
    </Panel>
  );
});

function TideCell({ label, time, height }: { label: string; time: string; height: string }) {
  return (
    <div>
      <p className="data-label">{label}</p>
      <p className="data-value mt-0.5">
        {time}
        <span className="ml-1.5" style={{ color: "var(--text-dim)" }}>{height}</span>
      </p>
    </div>
  );
}
