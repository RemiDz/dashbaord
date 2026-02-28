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
    const d = new Date(
      timeStr.includes("T") ? timeStr : timeStr.replace(" ", "T") + "Z",
    );
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return timeStr.slice(-5);
  }
}

/**
 * SVG wave path generator — creates a smooth sinusoidal wave.
 * Doubled width so it can translate -50% for seamless loop.
 */
function wavePath(
  width: number,
  amplitude: number,
  frequency: number,
  phaseOffset: number,
): string {
  const points: string[] = [];
  const totalWidth = width * 2; // doubled for seamless scroll
  const steps = 120;

  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * totalWidth;
    const y =
      amplitude * Math.sin((i / steps) * Math.PI * 2 * frequency + phaseOffset);
    points.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
  }

  // Close to fill below the wave
  points.push(`L${totalWidth},${amplitude + 20}`);
  points.push(`L0,${amplitude + 20}`);
  points.push("Z");

  return points.join(" ");
}

/** Cinematic layered wave animation at the bottom of the panel */
function WaterAnimation({
  rising,
  waterLevel,
}: {
  rising: boolean;
  waterLevel: number; // 0–1, normalised tide height
}) {
  const width = 600;
  const viewHeight = 80;
  // Water level affects how much of the panel is "filled"
  // Higher tide = waves are higher in the container
  const levelOffset = (1 - waterLevel) * 30; // 0–30px offset from top of container

  const layers = [
    {
      amplitude: 6,
      frequency: 2,
      phase: 0,
      opacity: 0.12,
      color: "rgba(80, 180, 230, 1)",
      duration: 8,
      yOffset: levelOffset + 12,
    },
    {
      amplitude: 4,
      frequency: 2.5,
      phase: 1.2,
      opacity: 0.18,
      color: "rgba(60, 150, 210, 1)",
      duration: 6,
      yOffset: levelOffset + 6,
    },
    {
      amplitude: 3,
      frequency: 3,
      phase: 2.4,
      opacity: 0.25,
      color: "rgba(40, 120, 200, 1)",
      duration: 4.5,
      yOffset: levelOffset,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: viewHeight,
        overflow: "hidden",
        borderRadius: "0 0 16px 16px",
        pointerEvents: "none",
      }}
    >
      {/* Deep water base gradient */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: Math.max(10, viewHeight - levelOffset - 10),
          background:
            "linear-gradient(180deg, rgba(20, 60, 120, 0.08) 0%, rgba(10, 40, 100, 0.15) 100%)",
          transition: "height 3s ease",
        }}
      />

      {/* Wave layers */}
      {layers.map((layer, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: width * 2,
            height: viewHeight,
            animation: `waveSlide${i + 1} ${layer.duration}s linear infinite`,
            willChange: "transform",
          }}
        >
          <svg
            width={width * 2}
            height={viewHeight}
            viewBox={`0 -${layer.amplitude + 2} ${width * 2} ${viewHeight}`}
            preserveAspectRatio="none"
            style={{ display: "block" }}
          >
            <path
              d={wavePath(width, layer.amplitude, layer.frequency, layer.phase)}
              fill={layer.color}
              fillOpacity={layer.opacity}
              style={{
                transform: `translateY(${layer.yOffset}px)`,
                transition: "transform 3s ease",
              }}
            />
          </svg>
        </div>
      ))}

      {/* Foam sparkle line at wave crest */}
      <div
        style={{
          position: "absolute",
          bottom: viewHeight - levelOffset - 10,
          left: 0,
          right: 0,
          height: 1,
          background:
            "linear-gradient(90deg, transparent 10%, rgba(200, 220, 255, 0.2) 30%, rgba(255, 255, 255, 0.35) 50%, rgba(200, 220, 255, 0.2) 70%, transparent 90%)",
          animation: "foamSparkle 3s ease-in-out infinite",
          transition: "bottom 3s ease",
        }}
      />

      {/* Rising/falling indicator glow */}
      {rising && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "100%",
            background:
              "linear-gradient(180deg, rgba(80, 180, 230, 0.04) 0%, rgba(80, 180, 230, 0.08) 100%)",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

export const TidalPanel = memo(function TidalPanel({
  style,
  animationDelay,
}: TidalPanelProps) {
  const {
    hourly,
    location,
    currentHeight,
    rising,
    nextHigh,
    nextLow,
    isLoading,
    error,
  } = useTidalData();

  const sparkData = hourly.map((p) => p.height);
  const hasData = currentHeight !== null;

  // Normalise water level 0–1 from the hourly data range
  let waterLevel = 0.5;
  if (hasData && sparkData.length > 1) {
    const min = Math.min(...sparkData);
    const max = Math.max(...sparkData);
    const range = max - min;
    waterLevel = range > 0 ? (currentHeight - min) / range : 0.5;
  }

  return (
    <Panel
      className="flex flex-col relative overflow-hidden"
      style={style}
      animationDelay={animationDelay}
    >
      {/* Header with rising/falling badge */}
      <div className="flex items-center justify-between relative z-10">
        <span className="panel-label">Tidal Intelligence</span>
        {hasData && (
          <span
            className="status-badge inline-flex items-center gap-1.5"
            style={{
              color: rising
                ? "var(--accent-tidal)"
                : "var(--text-secondary)",
              backgroundColor: rising
                ? "rgba(80, 180, 230, 0.1)"
                : "rgba(200, 196, 220, 0.08)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                animation: rising
                  ? "tideArrow 1.5s ease-in-out infinite"
                  : "tideArrowDown 1.5s ease-in-out infinite",
                fontSize: "clamp(12px, 0.9vw, 15px)",
              }}
            >
              {rising ? "▲" : "▼"}
            </span>
            {rising ? "RISING" : "FALLING"}
          </span>
        )}
      </div>

      {/* Hero tide height */}
      <div className="mt-2 relative z-10">
        {hasData ? (
          <div className="flex items-baseline">
            <AnimatedValue
              value={currentHeight.toFixed(1)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(36px, 3.5vw, 48px)",
                fontWeight: 300,
                color: "var(--accent-tidal)",
                lineHeight: 1,
              }}
            />
            <span
              className="font-body"
              style={{
                fontSize: "clamp(16px, 1.3vw, 20px)",
                color: "var(--moonsilver)",
                opacity: 0.4,
                marginLeft: 4,
              }}
            >
              m
            </span>
          </div>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "clamp(36px, 3.5vw, 48px)",
              color: "var(--text-dim)",
            }}
          >
            {isLoading ? "—" : "--"}
          </span>
        )}
        {!hasData && error && (
          <p
            className="font-body mt-1"
            style={{ color: "var(--text-dim)", fontSize: "0.8rem" }}
          >
            Awaiting data
          </p>
        )}
      </div>

      {/* Next high/low times */}
      <div className="flex gap-4 mt-2 relative z-10">
        <div>
          <p className="data-label">Next High</p>
          <p className="data-value mt-0.5" style={{ fontSize: "clamp(13px, 0.95vw, 16px)" }}>
            {nextHigh ? formatEventTime(nextHigh.time) : "—"}
            {nextHigh && (
              <span
                style={{ color: "var(--text-dim)", marginLeft: 4, fontSize: "0.75em" }}
              >
                {nextHigh.height.toFixed(1)}m
              </span>
            )}
          </p>
        </div>
        <div>
          <p className="data-label">Next Low</p>
          <p className="data-value mt-0.5" style={{ fontSize: "clamp(13px, 0.95vw, 16px)" }}>
            {nextLow ? formatEventTime(nextLow.time) : "—"}
            {nextLow && (
              <span
                style={{ color: "var(--text-dim)", marginLeft: 4, fontSize: "0.75em" }}
              >
                {nextLow.height.toFixed(1)}m
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Tidal curve sparkline */}
      <div className="relative z-10 mt-auto pt-2">
        {sparkData.length > 1 ? (
          <Sparkline
            data={sparkData}
            color="rgba(80, 180, 230, 0.9)"
            height={50}
            showArea
            pulseEndpoint
          />
        ) : (
          <div style={{ height: 50 }} />
        )}
      </div>

      {/* Station name */}
      <p className="data-label mt-1 relative z-10">{location}</p>

      {/* Cinematic water animation at bottom */}
      <WaterAnimation rising={rising} waterLevel={waterLevel} />
    </Panel>
  );
});
