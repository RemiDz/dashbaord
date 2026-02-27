"use client";

import { useEffect, useState } from "react";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { AlertBadges } from "@/components/dashboard/AlertBadges";
import { ParticleField } from "@/components/shared/ParticleField";
import { SacredGeometry } from "@/components/shared/SacredGeometry";
import { useKpIndex } from "@/hooks/useKpIndex";

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
  const { current: kp } = useKpIndex();

  useEffect(() => {
    setDateStr(formatDate(new Date()));
  }, []);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden relative"
      style={{
        background: "linear-gradient(180deg, #0a0a14 0%, #0d0d1a 100%)",
      }}
    >
      {/* Sacred geometry — barely visible behind everything */}
      <SacredGeometry />

      {/* Particle field behind panels */}
      <ParticleField kp={kp} />

      {/* Top bar */}
      <header
        className="relative flex items-center justify-between shrink-0"
        style={{ padding: "12px 24px 0", zIndex: 1 }}
      >
        {/* Date — left */}
        <time className="font-body text-sm text-text-brass-dim tracking-wide">
          {dateStr}
        </time>

        {/* Alert badges — right of centre */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertBadges />
          </div>

          {/* Branding — far right */}
          <h1 className="font-display text-xs tracking-[0.25em] uppercase text-text-brass-faint ml-4">
            Harmonic Waves
          </h1>
        </div>
      </header>

      {/* Dashboard grid */}
      <div className="relative flex-1 min-h-0" style={{ zIndex: 1 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
