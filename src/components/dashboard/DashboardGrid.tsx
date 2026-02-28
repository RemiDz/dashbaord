"use client";

import { ClockPanel } from "@/components/dashboard/panels/ClockPanel";
import { WeatherPanel } from "@/components/dashboard/panels/WeatherPanel";
import { LunarPanel } from "@/components/dashboard/panels/LunarPanel";
import { KpSchumannPanel } from "@/components/dashboard/panels/KpSchumannPanel";
import { SpaceWeatherPanel } from "@/components/dashboard/panels/SpaceWeatherPanel";
import { TidalPanel } from "@/components/dashboard/panels/TidalPanel";
import { GuidancePanel } from "@/components/dashboard/panels/GuidancePanel";

export function DashboardGrid() {
  return (
    <div className="dashboard-grid grid h-full card-stagger">
      {/* Row 1: Clock · Weather · Lunar */}
      <ClockPanel
        style={{ gridColumn: "1 / 5", gridRow: "1" }}
        animationDelay="0s"
      />
      <WeatherPanel
        style={{ gridColumn: "5 / 9", gridRow: "1" }}
        animationDelay="0.15s"
      />
      <LunarPanel
        style={{ gridColumn: "9 / 13", gridRow: "1" }}
        animationDelay="0.3s"
      />

      {/* Row 2: KP+Schumann · Space Weather · Tidal · Insight */}
      <KpSchumannPanel
        style={{ gridColumn: "1 / 4", gridRow: "2" }}
        animationDelay="0.45s"
      />
      <SpaceWeatherPanel
        style={{ gridColumn: "4 / 7", gridRow: "2" }}
        animationDelay="0.6s"
      />
      <TidalPanel
        style={{ gridColumn: "7 / 10", gridRow: "2" }}
        animationDelay="0.75s"
      />
      <GuidancePanel
        style={{ gridColumn: "10 / 13", gridRow: "2" }}
        animationDelay="0.9s"
      />
    </div>
  );
}
