"use client";

import { ClockPanel } from "@/components/dashboard/panels/ClockPanel";
import { WeatherPanel } from "@/components/dashboard/panels/WeatherPanel";
import { LunarPanel } from "@/components/dashboard/panels/LunarPanel";
import { KpSchumannPanel } from "@/components/dashboard/panels/KpSchumannPanel";
import { SpaceWeatherPanel } from "@/components/dashboard/panels/SpaceWeatherPanel";
import { TidalPanel } from "@/components/dashboard/panels/TidalPanel";
import { BeachCamPanel } from "@/components/dashboard/panels/BeachCamPanel";
import { CalendarPanel } from "@/components/dashboard/panels/CalendarPanel";

export function DashboardGrid() {
  return (
    <div className="dashboard-grid grid h-full card-stagger">
      {/* Row 1: Clock · Weather · Lunar · Calendar */}
      <ClockPanel
        style={{ gridColumn: "1 / 4", gridRow: "1" }}
        animationDelay="0s"
      />
      <WeatherPanel
        style={{ gridColumn: "4 / 7", gridRow: "1" }}
        animationDelay="0.15s"
      />
      <LunarPanel
        style={{ gridColumn: "7 / 10", gridRow: "1" }}
        animationDelay="0.3s"
      />
      <CalendarPanel
        style={{ gridColumn: "10 / 13", gridRow: "1" }}
        animationDelay="0.45s"
      />

      {/* Row 2: KP+Schumann · Space Weather · Tidal · Beach Cam */}
      <KpSchumannPanel
        style={{ gridColumn: "1 / 4", gridRow: "2" }}
        animationDelay="0.6s"
      />
      <SpaceWeatherPanel
        style={{ gridColumn: "4 / 7", gridRow: "2" }}
        animationDelay="0.75s"
      />
      <TidalPanel
        style={{ gridColumn: "7 / 10", gridRow: "2" }}
        animationDelay="0.9s"
      />
      <BeachCamPanel
        style={{ gridColumn: "10 / 13", gridRow: "2" }}
        animationDelay="1.05s"
      />
    </div>
  );
}
