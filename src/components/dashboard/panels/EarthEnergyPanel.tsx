"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useSchumannData } from "@/hooks/useSchumannData";

interface EnergyRow {
  label: string;
  value: string;
  pct: number;
  color: string;
}

function buildRows(kp: number | null, schumannDeviation: number): EnergyRow[] {
  // Geomagnetic — derived from KP (0–9 scale → 0–100%)
  const kpVal = kp ?? 0;
  const kpPct = Math.min(100, Math.round((kpVal / 9) * 100));
  const kpColor = kpVal >= 5
    ? "rgba(230, 90, 60, 0.9)"
    : kpVal >= 3
      ? "rgba(230, 130, 80, 0.9)"
      : "rgba(100, 200, 160, 0.9)";

  // Solar wind — estimated from Kp (rough correlation)
  const windSpeed = Math.round(350 + kpVal * 25);
  const windPct = Math.min(100, Math.round(((windSpeed - 300) / 400) * 100));

  // Ionospheric — estimated from combined Kp + Schumann deviation
  const ionLevel = kpVal * 0.4 + schumannDeviation * 0.3;
  const ionPct = Math.min(100, Math.round(ionLevel * 20));
  const ionLabel = ionLevel > 3 ? "Disturbed" : ionLevel > 1.5 ? "Moderate" : "Quiet";

  // Schumann power — from deviation
  const schSign = schumannDeviation >= 0 ? "+" : "";
  const schPct = Math.min(100, Math.round(schumannDeviation * 50));

  return [
    { label: "Geomagnetic", value: `Kp ${kpVal.toFixed(1)}`, pct: kpPct, color: kpColor },
    { label: "Solar Wind", value: `${windSpeed} km/s`, pct: windPct, color: "rgba(220, 185, 120, 0.9)" },
    { label: "Ionospheric", value: ionLabel, pct: ionPct, color: "rgba(230, 130, 80, 0.9)" },
    { label: "Schumann Power", value: `${schSign}${schumannDeviation.toFixed(1)} Hz`, pct: schPct, color: "rgba(205, 170, 110, 0.9)" },
  ];
}

interface EarthEnergyPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const EarthEnergyPanel = memo(function EarthEnergyPanel({ style, animationDelay }: EarthEnergyPanelProps) {
  const { current: kp, isLoading: kpLoading } = useKpIndex();
  const { deviation, isLoading: schLoading } = useSchumannData();

  const isLoading = kpLoading || schLoading;
  const rows = buildRows(kp, deviation);

  return (
    <Panel className="flex flex-col justify-between" style={style} animationDelay={animationDelay}>
      <span className="panel-label">Earth Energy</span>

      {isLoading && kp === null ? (
        <p className="value-sub mt-3">Connecting...</p>
      ) : (
        <div className="flex flex-col gap-3 mt-3">
          {rows.map((row) => (
            <div key={row.label}>
              {/* Label + value */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[0.6rem] uppercase tracking-wider"
                  style={{ color: "var(--text-brass-dim)" }}
                >
                  {row.label}
                </span>
                <span
                  className="font-mono text-[0.65rem]"
                  style={{ color: row.color, fontWeight: 300 }}
                >
                  {row.value}
                </span>
              </div>
              {/* Progress bar */}
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: "3px", backgroundColor: "rgba(205, 170, 110, 0.06)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${row.pct}%`,
                    background: `linear-gradient(90deg, ${row.color.replace(/[\d.]+\)$/, "0.3)")}, ${row.color})`,
                    transition: "width 1s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
});
