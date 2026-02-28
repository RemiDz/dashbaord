"use client";

import { memo, useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { Sparkline } from "@/components/shared/Sparkline";
import { AnimatedValue } from "@/components/shared/AnimatedValue";
import { useSchumannData } from "@/hooks/useSchumannData";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useLunarData } from "@/hooks/useLunarData";
import { useTidalData } from "@/hooks/useTidalData";
import { generateInsight, getTimeOfDay, type EarthState } from "@/lib/insight-engine";
import { getBinaraRecommendation, type BinaraRecommendation } from "@/lib/binara-engine";

interface KpSchumannPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

function getKpStatus(kp: number) {
  if (kp >= 5)
    return {
      label: "STORM",
      color: "rgba(255, 80, 60, 0.9)",
      desc: "Geomagnetic storm",
    };
  if (kp >= 3)
    return {
      label: "ELEVATED",
      color: "rgba(255, 150, 80, 0.9)",
      desc: "Elevated activity",
    };
  return {
    label: "QUIET",
    color: "rgba(100, 220, 170, 0.9)",
    desc: "Calm conditions",
  };
}

export const KpSchumannPanel = memo(function KpSchumannPanel({
  style,
  animationDelay,
}: KpSchumannPanelProps) {
  const schumann = useSchumannData();
  const kp = useKpIndex();
  const lunar = useLunarData();
  const tidal = useTidalData();

  const schumannSpark = schumann.history.map((e) => e.frequency);
  const kpSpark = kp.history.map((e) => e.kp);
  const kpStatus = getKpStatus(kp.current ?? 0);

  // Determine panel glow: KP storm takes priority, then Schumann spike
  const glowColor = kp.isElevated
    ? kpStatus.color
    : schumann.isSpike
      ? "rgba(120, 180, 255, 0.9)"
      : undefined;

  // Daily Insight
  const hasInsightData = kp.current !== null || !kp.isLoading;
  const insight = hasInsightData
    ? generateInsight({
        kp: kp.current,
        schumannDeviation: schumann.deviation,
        isSpike: schumann.isSpike,
        moonPhase: lunar.phaseName,
        moonSign: lunar.sign,
        moonElement: lunar.element,
        illumination: lunar.illumination,
        timeOfDay: getTimeOfDay(new Date().getHours()),
        tidalState: tidal.rising ? "rising" : "falling",
      } satisfies EarthState)
    : "";

  // Binara Recommendation
  const [rec, setRec] = useState<BinaraRecommendation | null>(null);
  useEffect(() => {
    setRec(
      getBinaraRecommendation(new Date().getHours(), {
        kp: kp.current,
        schumannDeviation: schumann.deviation,
      }),
    );
  }, [kp.current, schumann.deviation]);

  return (
    <Panel
      className="flex flex-col"
      style={style}
      animationDelay={animationDelay}
      glowColor={glowColor}
    >
      {/* ═══ Top half: Schumann Resonance ═══ */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="panel-label">Schumann Resonance</span>

        {/* Hero value */}
        <div className="flex items-baseline gap-1 mt-2">
          {schumann.current !== null ? (
            <>
              <AnimatedValue
                value={schumann.current.toFixed(2)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(28px, 2.5vw, 38px)",
                  fontWeight: 300,
                  color: "var(--accent-schumann)",
                }}
              />
              <span
                className="font-body"
                style={{
                  fontSize: "clamp(14px, 1vw, 18px)",
                  color: "var(--moonsilver)",
                  opacity: 0.4,
                }}
              >
                Hz
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(28px, 2.5vw, 38px)",
                color: "var(--text-dim)",
              }}
            >
              —
            </span>
          )}
        </div>

        {/* Sparkline with 7.83 Hz reference */}
        <div className="flex-1 min-h-0 mt-2">
          {schumannSpark.length > 1 ? (
            <Sparkline
              data={schumannSpark}
              color="rgba(120, 180, 255, 0.9)"
              threshold={7.83}
              height={60}
              pulseEndpoint={schumann.isSpike}
            />
          ) : (
            <div style={{ height: 60 }} />
          )}
        </div>

        <p className="data-label mt-1">24h trend · 7.83 Hz nominal</p>
      </div>

      {/* ═══ Glass divider ═══ */}
      <div
        className="w-full my-3"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* ═══ Bottom half: KP Index ═══ */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header with badge */}
        <div className="flex items-center justify-between">
          <span className="panel-label">KP Index</span>
          {kp.current !== null && (
            <span
              className="status-badge"
              style={{
                color: kpStatus.color,
                backgroundColor: kpStatus.color.replace(/[\d.]+\)$/, "0.1)"),
              }}
            >
              {kpStatus.label}
            </span>
          )}
        </div>

        {/* Hero value */}
        <div className="flex items-baseline gap-1 mt-2">
          {kp.current !== null ? (
            <>
              <AnimatedValue
                value={kp.current.toFixed(1)}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(28px, 2.5vw, 38px)",
                  fontWeight: 300,
                  color: kpStatus.color,
                }}
              />
              <span
                className="font-body"
                style={{
                  fontSize: "clamp(14px, 1vw, 18px)",
                  color: "var(--moonsilver)",
                  opacity: 0.4,
                }}
              >
                Kp
              </span>
            </>
          ) : (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(28px, 2.5vw, 38px)",
                color: "var(--text-dim)",
              }}
            >
              —
            </span>
          )}
        </div>

        {/* Sparkline with storm threshold */}
        <div className="flex-1 min-h-0 mt-2">
          {kpSpark.length > 1 ? (
            <Sparkline
              data={kpSpark}
              color={kpStatus.color}
              threshold={4}
              thresholdColor="rgba(255, 80, 60, 0.2)"
              height={60}
              pulseEndpoint={kp.isElevated}
            />
          ) : (
            <div style={{ height: 60 }} />
          )}
        </div>

        <p className="data-label mt-1">24h history · storm threshold 4+</p>
      </div>

      {/* ═══ Glass divider ═══ */}
      <div
        className="w-full my-2"
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* ═══ Compact Insight + Binara ═══ */}
      <div className="flex flex-col gap-1.5">
        {/* Daily Insight — single line italic */}
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(11px, 0.8vw, 14px)",
            fontStyle: "italic",
            fontWeight: 300,
            lineHeight: 1.4,
            color: "var(--text-secondary)",
            opacity: 0.8,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const,
            overflow: "hidden",
          }}
        >
          {insight || "Analysing conditions\u2026"}
        </p>

        {/* Binara — compact inline */}
        {rec && (
          <div
            className="flex items-center justify-between rounded-lg px-2 py-1"
            style={{
              background: `linear-gradient(135deg, ${rec.color.replace(/[\d.]+\)$/, "0.03)")}, ${rec.color.replace(/[\d.]+\)$/, "0.05)")})`,
              border: `1px solid ${rec.color.replace(/[\d.]+\)$/, "0.1)")}`,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(7px, 0.55vw, 9px)",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase" as const,
                color: "var(--moonsilver)",
                opacity: 0.5,
              }}
            >
              Binara
            </span>
            <span
              className="font-mono"
              style={{
                color: rec.color,
                fontWeight: 300,
                fontSize: "clamp(12px, 0.9vw, 15px)",
              }}
            >
              {rec.frequency} Hz
            </span>
            <span
              className="font-body"
              style={{
                color: rec.color,
                opacity: 0.7,
                fontSize: "clamp(10px, 0.7vw, 12px)",
              }}
            >
              {rec.band}
            </span>
          </div>
        )}
      </div>
    </Panel>
  );
});
