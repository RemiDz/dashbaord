"use client";

import { memo } from "react";
import { Panel } from "@/components/shared/Panel";
import { MoonPhase } from "@/components/shared/MoonPhase";
import { useLunarData } from "@/hooks/useLunarData";

interface LunarPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

export const LunarPanel = memo(function LunarPanel({ style, animationDelay }: LunarPanelProps) {
  const lunar = useLunarData();

  return (
    <Panel className="flex flex-col" style={style} animationDelay={animationDelay}>
      {/* Header */}
      <span className="panel-label">Lunar Phase</span>

      {/* Moon + phase info */}
      <div className="flex items-center gap-3 mt-2">
        <MoonPhase
          illumination={lunar.illumination}
          phase={lunar.phase}
          size={64}
        />
        <div>
          <p className="font-body text-sm" style={{ color: "var(--text-brass)", fontWeight: 400 }}>
            {lunar.phaseName}
          </p>
          <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-value)", fontWeight: 300 }}>
            {Math.round(lunar.illumination * 100)}%
            <span className="value-unit">illuminated</span>
          </p>
        </div>
      </div>

      {/* Sacred divider */}
      <div
        className="w-full my-3"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(205,170,110,0.2), transparent)",
        }}
      />

      {/* 2x2 info grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-auto">
        <InfoCell label="Sign" value={`${lunar.signSymbol} ${lunar.sign}`} />
        <InfoCell label="Element" value={`${lunar.elementSymbol} ${lunar.element}`} />
        <InfoCell label="Next Full" value={lunar.nextFull} />
        <InfoCell label="Void of Course" value={lunar.voidOfCourse} />
      </div>
    </Panel>
  );
});

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.55rem] uppercase tracking-wider" style={{ color: "var(--text-brass-faint)" }}>
        {label}
      </p>
      <p className="font-body text-xs" style={{ color: "var(--text-brass)", fontWeight: 400 }}>
        {value}
      </p>
    </div>
  );
}
