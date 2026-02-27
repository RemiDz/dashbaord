"use client";

import { memo, useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useSchumannData } from "@/hooks/useSchumannData";
import { useLunarData } from "@/hooks/useLunarData";
import { useTidalData } from "@/hooks/useTidalData";
import { generateInsight, getTimeOfDay, type EarthState } from "@/lib/insight-engine";
import { getBinaraRecommendation, type BinaraRecommendation } from "@/lib/binara-engine";

/* ── Earth Energy row builder ────────────────────────────── */

interface EnergyRow {
  label: string;
  value: string;
  pct: number;
  color: string;
}

function buildRows(kp: number | null, schumannDeviation: number): EnergyRow[] {
  const kpVal = kp ?? 0;
  const kpPct = Math.min(100, Math.round((kpVal / 9) * 100));
  const kpColor = kpVal >= 5
    ? "rgba(255, 80, 60, 0.9)"
    : kpVal >= 3
      ? "rgba(255, 150, 80, 0.9)"
      : "rgba(100, 220, 170, 0.9)";

  const windSpeed = Math.round(350 + kpVal * 25);
  const windPct = Math.min(100, Math.round(((windSpeed - 300) / 400) * 100));

  const ionLevel = kpVal * 0.4 + schumannDeviation * 0.3;
  const ionPct = Math.min(100, Math.round(ionLevel * 20));
  const ionLabel = ionLevel > 3 ? "Disturbed" : ionLevel > 1.5 ? "Moderate" : "Quiet";

  const schSign = schumannDeviation >= 0 ? "+" : "";
  const schPct = Math.min(100, Math.round(schumannDeviation * 50));

  return [
    { label: "Geomagnetic", value: `Kp ${kpVal.toFixed(1)}`, pct: kpPct, color: kpColor },
    { label: "Solar Wind", value: `${windSpeed} km/s`, pct: windPct, color: "rgba(180, 200, 255, 0.7)" },
    { label: "Ionospheric", value: ionLabel, pct: ionPct, color: "rgba(255, 150, 80, 0.7)" },
    { label: "Schumann", value: `${schSign}${schumannDeviation.toFixed(1)} Hz`, pct: schPct, color: "rgba(120, 180, 255, 0.7)" },
  ];
}

/* ── Component ───────────────────────────────────────────── */

interface GuidancePanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const GuidancePanel = memo(function GuidancePanel({ style, animationDelay }: GuidancePanelProps) {
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

  const [rec, setRec] = useState<BinaraRecommendation | null>(null);
  useEffect(() => {
    setRec(getBinaraRecommendation(new Date().getHours(), { kp, schumannDeviation: deviation }));
  }, [kp, deviation]);

  const rows = buildRows(kp, deviation);

  return (
    <Panel className="flex flex-col" style={style} animationDelay={animationDelay}>
      {/* ── Daily Insight (hero) ── */}
      <span className="panel-label">Daily Insight</span>
      <p className="insight-text mt-2 flex-shrink-0">
        {isLoading && !hasData ? "Analysing conditions..." : insight}
      </p>

      {/* ── Divider ── */}
      <div
        className="w-full my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* ── Binara Recommendation (compact accent card) ── */}
      {rec && (
        <div
          className="rounded-lg px-3 py-2.5"
          style={{
            border: `1px solid ${rec.color.replace(/[\d.]+\)$/, "0.15)")}`,
            background: rec.color.replace(/[\d.]+\)$/, "0.04)"),
          }}
        >
          <div className="flex items-baseline justify-between">
            <span className="data-label">Binara · Recommended</span>
            <span
              className="font-mono"
              style={{
                color: rec.color,
                fontWeight: 300,
                fontSize: "clamp(16px, 1.2vw, 20px)",
              }}
            >
              {rec.frequency} Hz
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <span className="value-sub" style={{ fontWeight: 300 }}>
              {rec.band}
            </span>
            <p className="value-sub" style={{ color: "var(--text-dim)", fontSize: "clamp(11px, 0.8vw, 14px)" }}>
              {rec.description}
            </p>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div
        className="w-full my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* ── Earth Energy (compact bars) ── */}
      <span className="data-label">Earth Energy</span>
      <div className="flex flex-col gap-1.5 mt-1.5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="flex items-center justify-between">
              <span className="data-label">{row.label}</span>
              <span className="font-mono" style={{ color: row.color, fontWeight: 300, fontSize: "clamp(10px, 0.7vw, 13px)" }}>
                {row.value}
              </span>
            </div>
            <div
              className="w-full rounded-full overflow-hidden mt-0.5"
              style={{ height: "2px", backgroundColor: "rgba(255, 255, 255, 0.04)" }}
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${row.pct}%`,
                  background: `linear-gradient(90deg, ${row.color.replace(/[\d.]+\)$/, "0.2)")}, ${row.color})`,
                  transition: "width 1s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <p className="data-label mt-auto pt-2">Generated from live conditions</p>
    </Panel>
  );
});
