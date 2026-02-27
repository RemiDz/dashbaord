"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { useKpIndex } from "@/hooks/useKpIndex";

// Use raw rgba values so .replace() works for deriving semi-transparent backgrounds
function getStatus(kp: number) {
  if (kp >= 5) return { label: "STORM", color: "rgba(230, 90, 60, 0.9)", desc: "Geomagnetic storm conditions" };
  if (kp >= 3) return { label: "ELEVATED", color: "rgba(230, 130, 80, 0.95)", desc: "Elevated geomagnetic activity" };
  return { label: "QUIET", color: "rgba(100, 200, 160, 0.9)", desc: "Calm geomagnetic conditions" };
}

interface KpIndexPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const KpIndexPanel = memo(function KpIndexPanel({ style, animationDelay }: KpIndexPanelProps) {
  const { current, history, isElevated, isLoading, error } = useKpIndex();

  const hasData = current !== null;
  const status = getStatus(current ?? 0);
  const sparkData = history.map((e) => e.kp);

  return (
    <Panel className="flex flex-col justify-between" style={style} animationDelay={animationDelay} glowColor={isElevated ? status.color : undefined}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="panel-label">KP Index</span>
        {hasData && (
          <span
            className="panel-label px-2 py-0.5 rounded-sm"
            style={{
              color: status.color,
              backgroundColor: status.color.replace(/[\d.]+\)$/, "0.1)"),
              letterSpacing: "0.12em",
            }}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Current value */}
      <div className="mt-2">
        {hasData ? (
          <>
            <span className="value-large" style={{ color: status.color }}>
              {current.toFixed(1)}
            </span>
            <span className="value-unit">Kp</span>
          </>
        ) : (
          <span className="value-large" style={{ color: "var(--text-brass-faint)" }}>
            {isLoading ? "—" : "--"}
          </span>
        )}
      </div>

      {/* Subtitle */}
      <p className="value-sub mt-1">
        {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : status.desc}
      </p>

      {/* Sparkline */}
      <div className="mt-auto pt-3">
        {sparkData.length > 1 ? (
          <Sparkline
            data={sparkData}
            color={status.color}
            threshold={4}
            thresholdColor="rgba(230, 90, 60, 0.25)"
            height={48}
            pulseEndpoint={isElevated}
          />
        ) : (
          <div style={{ height: 48 }} />
        )}
      </div>

      {/* Footer */}
      <p className="value-sub mt-1 text-[0.65rem]" style={{ color: "var(--text-brass-faint)" }}>
        24h history · 3h readings
      </p>
    </Panel>
  );
});
