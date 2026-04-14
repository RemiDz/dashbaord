"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { ClockRenderer } from "@/components/clock/variants";
import { useSettings, type ClockId } from "@/contexts/SettingsContext";

const DIGITAL_VARIANTS = new Set<ClockId>(["digital-mono", "flip-digital", "word-clock"]);

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

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
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
  const { clock } = useSettings();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [tz, setTz] = useState("");

  // Responsive clock size — large, filling most of the card
  const [clockSize, setClockSize] = useState(280);
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const fromWidth = Math.round(vw * 0.25);
      const fromHeight = Math.round((vh - 56) * 0.42);
      setClockSize(Math.min(360, Math.max(200, Math.min(fromWidth, fromHeight))));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(formatTime(now));
      setDate(formatDate(now));
    }
    tick();
    setTz(getTimezone());
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Panel
      className="flex flex-col items-center justify-center"
      style={style}
      animationDelay={animationDelay}
    >
      {/* Clock face — user-selectable variant */}
      <div className="flex-1 flex items-center justify-center">
        <ClockRenderer variant={clock} size={clockSize} />
      </div>

      {/* Digital time — hidden for already-digital variants to avoid duplication */}
      {!DIGITAL_VARIANTS.has(clock) && (
        <div
          className="font-mono tracking-widest mt-2"
          style={{
            color: "var(--accent-gold)",
            fontWeight: 300,
            fontSize: "clamp(1.2rem, 1.8vw, 1.6rem)",
          }}
        >
          {time}
        </div>
      )}

      {/* Date */}
      <p
        className="font-body tracking-wide mt-1"
        style={{
          color: "var(--moonsilver)",
          opacity: 0.5,
          fontSize: "clamp(0.7rem, 0.9vw, 0.85rem)",
        }}
      >
        {date}
      </p>

      {/* Timezone — faint */}
      <p
        className="font-body mt-0.5"
        style={{
          color: "var(--moonsilver)",
          opacity: 0.25,
          fontSize: "clamp(0.55rem, 0.65vw, 0.65rem)",
        }}
      >
        {tz}
      </p>
    </Panel>
  );
}
