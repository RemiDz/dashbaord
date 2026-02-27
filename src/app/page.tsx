"use client";

import { useEffect, useState } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AlertBadges } from "@/components/dashboard/AlertBadges";
import { StarField } from "@/components/shared/StarField";
import { TartarianClock } from "@/components/clock/TartarianClock";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Home() {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  useEffect(() => {
    function tick() {
      const now = new Date();
      setDateStr(formatDate(now));
      setTimeStr(formatTime(now));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative bg-deep-space">
      {/* Star field — fixed behind everything */}
      <StarField />

      {/* Top bar */}
      <header
        className="relative flex items-center justify-between shrink-0"
        style={{ padding: "10px 24px 0", zIndex: 1 }}
      >
        {/* Left: Clock + digital time + date */}
        <div className="flex items-center gap-3">
          <TartarianClock size={52} />
          <div className="flex flex-col">
            <span
              className="font-mono text-sm tracking-widest"
              style={{ color: "var(--accent-gold)", fontWeight: 300 }}
            >
              {timeStr}
            </span>
            <time
              className="font-body text-xs tracking-wide"
              style={{ color: "var(--text-dim)" }}
            >
              {dateStr}
            </time>
          </div>
        </div>

        {/* Centre: Alert badges */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <AlertBadges />
        </div>

        {/* Right: Branding */}
        <h1
          className="font-display text-xs tracking-[0.25em] uppercase"
          style={{ color: "var(--text-dim)" }}
        >
          Harmonic Waves
        </h1>
      </header>

      {/* Dashboard grid */}
      <div className="relative flex-1 min-h-0" style={{ zIndex: 1 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
