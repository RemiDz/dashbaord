"use client";

import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { StarField } from "@/components/shared/StarField";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden relative cosmic-atmosphere cosmic-dust">
      <StarField />

      <div className="relative flex-1 min-h-0" style={{ zIndex: 1 }}>
        <DashboardGrid />
      </div>
    </div>
  );
}
