"use client";

import { memo, useEffect, useRef } from "react";
import { Panel } from "@/components/shared/Panel";
import { MoonPhase } from "@/components/shared/MoonPhase";
import { useLunarData } from "@/hooks/useLunarData";

interface LunarPanelProps {
  style?: React.CSSProperties;
  animationDelay?: string;
}

/** Subtle star dots drawn inside the panel behind the moon */
function PanelStars() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;

      const ctx = canvas!.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Seeded random for consistent stars
      let seed = 7;
      function rng() {
        seed = (seed * 16807 + 0) % 2147483647;
        return seed / 2147483647;
      }

      // Draw ~40 tiny star dots
      for (let i = 0; i < 40; i++) {
        const x = rng() * w;
        const y = rng() * h;
        const r = 0.3 + rng() * 0.8;
        const alpha = 0.08 + rng() * 0.15;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 240, ${alpha})`;
        ctx.fill();
      }
    }

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}

export const LunarPanel = memo(function LunarPanel({ style, animationDelay }: LunarPanelProps) {
  const lunar = useLunarData();

  return (
    <Panel
      className="flex flex-col relative overflow-hidden"
      style={style}
      animationDelay={animationDelay}
    >
      {/* Star dots behind everything */}
      <PanelStars />

      {/* Panel label */}
      <span className="panel-label relative z-10">Lunar Phase</span>

      {/* Moon centred prominently */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 my-2">
        <MoonPhase
          illumination={lunar.illumination}
          phase={lunar.phase}
          size={130}
        />

        {/* Phase name below moon */}
        <p
          className="font-heading mt-1 text-center"
          style={{
            color: "var(--text-primary)",
            fontWeight: 500,
            fontSize: "clamp(18px, 1.4vw, 24px)",
            letterSpacing: "1px",
          }}
        >
          {lunar.phaseName}
        </p>

        {/* Illumination */}
        <p
          className="font-mono text-center"
          style={{
            color: "var(--accent-lunar)",
            fontWeight: 300,
            fontSize: "clamp(28px, 2.5vw, 38px)",
            lineHeight: 1.1,
          }}
        >
          {Math.round(lunar.illumination * 100)}%
          <span
            className="value-unit"
            style={{ fontSize: "clamp(14px, 1vw, 17px)" }}
          >
            illuminated
          </span>
        </p>
      </div>

      {/* Divider */}
      <div
        className="w-full relative z-10"
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)",
        }}
      />

      {/* Data arranged below moon: 3×2 grid */}
      <div className="grid grid-cols-3 gap-x-4 gap-y-2 mt-3 relative z-10">
        <InfoCell label="Sign" value={`${lunar.signSymbol} ${lunar.sign}`} />
        <InfoCell label="Element" value={`${lunar.elementSymbol} ${lunar.element}`} />
        <InfoCell label="Next Full" value={lunar.nextFull} />
        <InfoCell label="Void of Course" value={lunar.voidOfCourse} colSpan />
      </div>
    </Panel>
  );
});

function InfoCell({ label, value, colSpan }: { label: string; value: string; colSpan?: boolean }) {
  return (
    <div style={colSpan ? { gridColumn: "span 3", textAlign: "center" } : undefined}>
      <p className="data-label">{label}</p>
      <p className="data-value mt-0.5">{value}</p>
    </div>
  );
}
