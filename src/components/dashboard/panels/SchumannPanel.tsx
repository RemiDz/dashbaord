"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
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
    <Panel className="flex flex-col justify-between" style={style} animationDelay={animationDelay} glowColor={isSpike ? "rgba(120, 180, 255, 0.9)" : undefined}>
      <span className="panel-label">Schumann Resonance</span>

      {/* Hero value with pulsing glow */}
      <div className="mt-3">
        {hasData ? (
          <>
            <AnimatedValue
              value={current.toFixed(2)}
              className={`value-large ${nearResonance ? "animate-breathe" : ""}`}
              style={{
                color: "var(--accent-schumann)",
                animation: "schumannPulse 2s ease-in-out infinite",
              }}
            />
            <span className="value-unit">Hz</span>
          </>
        ) : (
          <span className="value-large" style={{ color: "var(--text-dim)" }}>
            {isLoading ? "—" : "--"}
          </span>
        )}
      </div>

      <p className="value-sub mt-1">
        {isLoading && !hasData ? "Connecting..." : error && !hasData ? "Awaiting data" : "Base frequency · 7.83 Hz nominal"}
      </p>

      {/* Sparkline — generous space */}
      <div className="mt-auto pt-3 flex-1 flex items-end">
        {sparkData.length > 1 ? (
          <div className="w-full">
            <Sparkline data={sparkData} color="rgba(120, 180, 255, 0.9)" threshold={7.83} height={100} pulseEndpoint={isSpike} />
          </div>
        ) : (
          <div style={{ height: 100 }} className="w-full" />
        )}
      </div>

      <p className="data-label mt-2">24h trend · 30min intervals</p>
    </Panel>
  );
});
