"use client";

import { useEffect, useState } from "react";
import { Panel } from "@/components/shared/Panel";
import { TartarianClock } from "@/components/clock/TartarianClock";

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
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [tz, setTz] = useState("");

  // Responsive clock size — large, filling most of the card
  const [clockSize, setClockSize] = useState(280);
  useEffect(() => {
    function updateSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Use the smaller of width-based and height-based scaling
      // Width: panel is ~4/12 of viewport = 33%, clock should be ~75% of that
      const fromWidth = Math.round(vw * 0.25);
      // Height: row 1 is ~50% of viewport minus header, clock takes most of it
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
      {/* Tartarian Clock — hero element, fills most of the card */}
      <div className="flex-1 flex items-center justify-center">
        <TartarianClock size={clockSize} />
      </div>

      {/* Digital time — large, gold */}
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
