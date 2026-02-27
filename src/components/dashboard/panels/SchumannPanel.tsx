"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { useSchumannData } from "@/hooks/useSchumannData";

interface SchumannPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const SchumannPanel = memo(function SchumannPanel({ style, animationDelay }: SchumannPanelProps) {
  const { current, history, nearResonance, isSpike, isLoading, error } = useSchumannData();

  const sparkData = history.map((e) => e.frequency);
  const hasData = current !== null;

  return (
    <Panel className="flex flex-col justify-between" style={style} animationDelay={animationDelay} glowColor={isSpike ? "rgba(205, 170, 110, 0.9)" : undefined}>
      {/* Header */}
      <div>
        <span className="panel-label">Schumann Resonance</span>
      </div>

      {/* Current value */}
      <div className="mt-2">
        {hasData ? (
          <>
            <span className={`value-large ${nearResonance ? "animate-breathe" : ""}`}>
              {current.toFixed(2)}
            </span>
            <span className="value-unit">Hz</span>
          </>
        ) : (
          <span className="value-large" style={{ color: "var(--text-brass-faint)" }}>
            {isLoading ? "—" : "--"}
          </span>
        )}
      </div>

      {/* Subtitle */}
      <p className="value-sub mt-1">
        {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : "Base frequency · 7.83 Hz nominal"}
      </p>

      {/* Sparkline */}
      <div className="mt-auto pt-3">
        {sparkData.length > 1 ? (
          <Sparkline data={sparkData} threshold={7.83} height={48} pulseEndpoint={isSpike} />
        ) : (
          <div style={{ height: 48 }} />
        )}
      </div>

      {/* Footer */}
      <p className="value-sub mt-1 text-[0.65rem]" style={{ color: "var(--text-brass-faint)" }}>
        24h trend · 30min intervals
      </p>
    </Panel>
  );
});
