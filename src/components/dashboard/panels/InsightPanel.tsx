"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useSchumannData } from "@/hooks/useSchumannData";
import { useLunarData } from "@/hooks/useLunarData";
import { useTidalData } from "@/hooks/useTidalData";
import { generateInsight, getTimeOfDay, type EarthState } from "@/lib/insight-engine";

interface InsightPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const InsightPanel = memo(function InsightPanel({ style, animationDelay }: InsightPanelProps) {
  const { current: kp, isLoading: kpLoading } = useKpIndex();
  const { isSpike, deviation, isLoading: schLoading } = useSchumannData();
  const lunar = useLunarData();
  const tidal = useTidalData();

  const isLoading = kpLoading || schLoading || lunar.isLoading;
  const hasData = kp !== null || !kpLoading;

  const insight = hasData
    ? generateInsight({
        kp,
        schumannDeviation: deviation,
        isSpike,
        moonPhase: lunar.phaseName,
        moonSign: lunar.sign,
        moonElement: lunar.element,
        illumination: lunar.illumination,
        timeOfDay: getTimeOfDay(new Date().getHours()),
        tidalState: tidal.rising ? "rising" : "falling",
      } satisfies EarthState)
    : "";

  return (
    <Panel className="flex flex-col justify-between" style={style} animationDelay={animationDelay}>
      <span className="panel-label">Daily Insight</span>

      {/* Guidance text */}
      <p
        className="font-body leading-relaxed mt-3 insight-text"
        style={{
          color: "var(--text-brass)",
          fontStyle: "italic",
          fontWeight: 300,
        }}
      >
        {isLoading && !hasData ? "Analysing conditions..." : insight}
      </p>

      {/* Sacred divider */}
      <div
        className="w-full mt-auto mb-1.5"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(205,170,110,0.2), transparent)",
        }}
      />

      {/* Footer */}
      <p className="text-[0.55rem] uppercase tracking-wider" style={{ color: "var(--text-brass-faint)" }}>
        Generated from live conditions
      </p>
    </Panel>
  );
});
