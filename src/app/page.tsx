"use client";

import { useEffect, useState } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AlertBadges } from "@/components/dashboard/AlertBadges";
import { StarField } from "@/components/shared/StarField";

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Home() {
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    function tick() {
      setDateStr(formatDate(new Date()));
    }
    tick();
    const id = setInterval(tick, 60_000); // Date changes once per minute is plenty
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative cosmic-atmosphere cosmic-dust">
      {/* Star field — fixed behind everything (Lunata CosmicBackground) */}
      <StarField />

      {/* Top bar — slim, transparent, 40px */}
      <header
        className="relative flex items-center justify-between shrink-0"
        style={{
          height: 40,
          padding: "0 20px",
          zIndex: 1,
          background: "linear-gradient(180deg, rgba(5,5,15,0.4) 0%, transparent 100%)",
        }}
      >
        {/* Left: Branding */}
        <h1
          className="font-display text-xs tracking-[0.25em] uppercase"
          style={{ color: "var(--moonsilver)", opacity: 0.5 }}
        >
          Harmonic Waves
        </h1>

        {/* Centre: Alert badges */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
          <AlertBadges />
        </div>

        {/* Right: Date */}
        <time
          className="font-body text-xs tracking-wide"
          style={{ color: "var(--moonsilver)", opacity: 0.4 }}
        >
          {dateStr}
        </time>
      </header>

      {/* Dashboard grid */}
      <div className="relative flex-1 min-h-0" style={{ zIndex: 1 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
