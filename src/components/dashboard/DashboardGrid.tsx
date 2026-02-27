"use client";

import { SchumannPanel } from "@/components/dashboard/panels/SchumannPanel";
import { KpIndexPanel } from "@/components/dashboard/panels/KpIndexPanel";
import { ClockPanel } from "@/components/dashboard/panels/ClockPanel";
import { LunarPanel } from "@/components/dashboard/panels/LunarPanel";
import { WeatherPanel } from "@/components/dashboard/panels/WeatherPanel";
import { TidalPanel } from "@/components/dashboard/panels/TidalPanel";
import { EarthEnergyPanel } from "@/components/dashboard/panels/EarthEnergyPanel";
import { InsightPanel } from "@/components/dashboard/panels/InsightPanel";

export function DashboardGrid() {
  return (
    <div
      className="dashboard-grid grid h-full"
      style={{
        gridTemplateRows: "1fr 1fr",
      }}
    >
      {/* Row 1 */}
      <SchumannPanel
        style={{ gridColumn: "1", gridRow: "1" }}
        animationDelay="0s"
      />

      <KpIndexPanel
        style={{ gridColumn: "2", gridRow: "1" }}
        animationDelay="0.05s"
      />

      <ClockPanel
        style={{ gridColumn: "3", gridRow: "1 / 3" }}
        animationDelay="0.1s"
      />

      <LunarPanel
        style={{ gridColumn: "4", gridRow: "1" }}
        animationDelay="0.15s"
      />

      <WeatherPanel
        style={{ gridColumn: "5", gridRow: "1" }}
        animationDelay="0.2s"
      />

      {/* Row 2 */}
      <TidalPanel
        style={{ gridColumn: "1 / 3", gridRow: "2" }}
        animationDelay="0.25s"
      />

      <EarthEnergyPanel
        style={{ gridColumn: "4", gridRow: "2" }}
        animationDelay="0.3s"
      />

      <InsightPanel
        style={{ gridColumn: "5", gridRow: "2" }}
        animationDelay="0.35s"
      />
    </div>
  );
}
