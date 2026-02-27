"use client";

import { SchumannPanel } from "@/components/dashboard/panels/SchumannPanel";
import { KpIndexPanel } from "@/components/dashboard/panels/KpIndexPanel";
import { LunarPanel } from "@/components/dashboard/panels/LunarPanel";
import { WeatherPanel } from "@/components/dashboard/panels/WeatherPanel";
import { TidalPanel } from "@/components/dashboard/panels/TidalPanel";
import { GuidancePanel } from "@/components/dashboard/panels/GuidancePanel";

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

      <LunarPanel
        style={{ gridColumn: "2", gridRow: "1" }}
        animationDelay="0.05s"
      />

      <WeatherPanel
        style={{ gridColumn: "3", gridRow: "1" }}
        animationDelay="0.1s"
      />

      {/* Row 2 */}
      <KpIndexPanel
        style={{ gridColumn: "1", gridRow: "2" }}
        animationDelay="0.15s"
      />

      <TidalPanel
        style={{ gridColumn: "2", gridRow: "2" }}
        animationDelay="0.2s"
      />

      <GuidancePanel
        style={{ gridColumn: "3", gridRow: "2" }}
        animationDelay="0.25s"
      />
    </div>
  );
}
