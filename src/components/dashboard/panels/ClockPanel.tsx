"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { TartarianClock } from "@/components/clock/TartarianClock";
import { getBinaraRecommendation, type BinaraRecommendation } from "@/lib/binara-engine";
import { useKpIndex } from "@/hooks/useKpIndex";
import { useSchumannData } from "@/hooks/useSchumannData";

interface ClockPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

function getTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.replace(/_/g, " ");
  } catch {
    return "Local Time";
  }
}

export function ClockPanel({ style, animationDelay }: ClockPanelProps) {
  const [time, setTime] = useState("");
  const [rec, setRec] = useState<BinaraRecommendation | null>(null);
  const [tz, setTz] = useState("");

  const { current: kp } = useKpIndex();
  const { deviation } = useSchumannData();

  // Responsive clock size: scale with viewport width
  const [clockSize, setClockSize] = useState(200);
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      // 170px at 1366, 200px at 1920, 240px at 2560, 280px at 3840
      setClockSize(Math.round(Math.min(280, Math.max(170, vw * 0.104))));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(formatTime(now));
      setRec(getBinaraRecommendation(now.getHours(), { kp, schumannDeviation: deviation }));
    }

    tick();
    setTz(getTimezone());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [kp, deviation]);

  return (
    <Panel
      className="flex flex-col items-center"
      style={style}
      animationDelay={animationDelay}
    >
      {/* Tartarian Clock */}
      <div className="mt-1">
        <TartarianClock size={clockSize} />
      </div>

      {/* Digital time */}
      <div
        className="font-mono text-xl tracking-widest mt-3"
        style={{
          color: "var(--text-value)",
          fontWeight: 300,
        }}
      >
        {time}
      </div>

      {/* Timezone */}
      <p className="value-sub mt-0.5 text-[0.65rem]" style={{ color: "var(--text-brass-faint)" }}>
        {tz}
      </p>

      {/* Sacred divider */}
      <div
        className="w-12 mx-auto my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(205,170,110,0.3), transparent)",
        }}
      />

      {/* Binara recommended frequency card */}
      {rec && (
        <div
          className="w-full rounded-sm px-3 py-2"
          style={{
            border: `1px solid ${rec.color.replace(/[\d.]+\)$/, "0.2)")}`,
            background: rec.color.replace(/[\d.]+\)$/, "0.05)"),
          }}
        >
          <span
            className="panel-label"
            style={{ fontSize: "0.55rem", letterSpacing: "0.15em" }}
          >
            Binara · Recommended
          </span>
          <div className="mt-1" style={{ color: rec.color }}>
            <span className="font-mono text-sm font-light">
              {rec.frequency} Hz
            </span>
            <span className="font-body text-sm ml-1.5" style={{ fontWeight: 300 }}>
              {rec.band}
            </span>
          </div>
          <p
            className="font-body text-xs mt-0.5"
            style={{ color: "var(--text-brass-dim)", fontWeight: 300 }}
          >
            {rec.description}
          </p>
        </div>
      )}
    </Panel>
  );
}
