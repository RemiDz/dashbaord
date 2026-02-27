"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useKpIndex } from "@/hooks/useKpIndex";

function getStatus(kp: number) {
  if (kp >= 5) return { label: "STORM", color: "rgba(255, 80, 60, 0.9)", desc: "Geomagnetic storm conditions", ambientColor: "rgba(255, 80, 60, 0.06)" };
  if (kp >= 3) return { label: "ELEVATED", color: "rgba(255, 150, 80, 0.9)", desc: "Elevated geomagnetic activity", ambientColor: "rgba(255, 150, 80, 0.05)" };
  return { label: "QUIET", color: "rgba(100, 220, 170, 0.9)", desc: "Calm geomagnetic conditions", ambientColor: "rgba(100, 220, 170, 0.04)" };
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
      {/* Ambient background tint based on KP level */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          background: `radial-gradient(ellipse at 30% 40%, ${status.ambientColor} 0%, transparent 70%)`,
          transition: "background 2s ease",
          pointerEvents: "none",
        }}
      />

      {/* Header with status badge */}
      <div className="flex items-center justify-between relative z-10">
        <span className="panel-label">KP Index</span>
        {hasData && (
          <span
            className="status-badge"
            style={{
              color: status.color,
              backgroundColor: status.color.replace(/[\d.]+\)$/, "0.1)"),
            }}
          >
            {status.label}
          </span>
        )}
      </div>

      {/* Hero value */}
      <div className="mt-3 relative z-10">
        {hasData ? (
          <>
            <AnimatedValue
              value={current.toFixed(1)}
              className="value-large"
              style={{ color: status.color }}
            />
            <span className="value-unit">Kp</span>
          </>
        ) : (
          <span className="value-large" style={{ color: "var(--text-dim)" }}>
            {isLoading ? "—" : "--"}
          </span>
        )}
      </div>

      <p className="value-sub mt-1 relative z-10">
        {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : status.desc}
      </p>

      {/* Sparkline */}
      <div className="mt-auto pt-4 relative z-10">
        {sparkData.length > 1 ? (
          <Sparkline
            data={sparkData}
            color={status.color}
            threshold={4}
            thresholdColor="rgba(255, 80, 60, 0.2)"
            height={100}
            pulseEndpoint={isElevated}
          />
        ) : (
          <div style={{ height: 100 }} />
        )}
      </div>

      <p className="data-label mt-2 relative z-10">24h history · 3h readings</p>
    </Panel>
  );
});
