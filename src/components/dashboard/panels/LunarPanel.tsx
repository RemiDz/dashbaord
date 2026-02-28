"use client";

import { memo, useEffect, useRef, useState } from "react";
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

      // ~50 tiny star dots
      for (let i = 0; i < 50; i++) {
        const x = rng() * w;
        const y = rng() * h;
        const r = 0.3 + rng() * 0.8;
        const alpha = 0.08 + rng() * 0.18;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 196, 220, ${alpha})`;
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

/** Phase direction text — "Growing toward Full", "Waning toward New", etc. */
function getPhaseDirection(phase: number): string {
  if (phase < 0.025 || phase >= 0.975) return "New Moon";
  if (phase < 0.5) return "Growing toward Full";
  if (phase < 0.525) return "Full Moon";
  return "Waning toward New";
}

export const LunarPanel = memo(function LunarPanel({ style, animationDelay }: LunarPanelProps) {
  const lunar = useLunarData();

  // Responsive moon size — large, filling most of the available space
  const [moonSize, setMoonSize] = useState(220);
  useEffect(() => {
    function updateSize() {
      const vh = window.innerHeight;
      // Row 1 is ~50% of viewport minus header (~40px). Moon should be generous.
      const available = (vh - 56) * 0.5;
      setMoonSize(Math.min(320, Math.max(180, Math.round(available * 0.52))));
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

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

      {/* Moon centred prominently — the hero element */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
        <MoonPhase
          illumination={lunar.illumination}
          phase={lunar.phase}
          size={moonSize}
        />

        {/* Phase name below moon — elegant serif */}
        <p
          className="font-body text-center"
          style={{
            color: "var(--selenite-white)",
            fontWeight: 400,
            fontSize: "clamp(18px, 1.5vw, 24px)",
            letterSpacing: "1px",
            marginTop: 4,
          }}
        >
          {lunar.phaseName}
        </p>

        {/* Phase direction status */}
        <p
          className="font-body text-center"
          style={{
            color: "var(--moonsilver)",
            opacity: 0.5,
            fontStyle: "italic",
            fontWeight: 300,
            fontSize: "clamp(11px, 0.85vw, 14px)",
            marginTop: 2,
          }}
        >
          {getPhaseDirection(lunar.phase)}
        </p>

        {/* Illumination — large hero number */}
        <p
          className="font-mono text-center"
          style={{
            color: "var(--selenite-white)",
            fontWeight: 300,
            fontSize: "clamp(28px, 2.5vw, 38px)",
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          {Math.round(lunar.illumination * 100)}%
          <span
            className="font-body"
            style={{
              fontSize: "clamp(12px, 0.9vw, 15px)",
              color: "var(--moonsilver)",
              opacity: 0.4,
              marginLeft: 6,
            }}
          >
            illuminated
          </span>
        </p>
      </div>

      {/* Glass divider */}
      <div
        className="w-full relative z-10"
        style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(200, 196, 220, 0.08), transparent)",
        }}
      />

      {/* Data grid — arranged below moon */}
      <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-3 relative z-10">
        <InfoCell
          label="Sign"
          value={`${lunar.signSymbol} ${lunar.sign}`}
        />
        <InfoCell
          label="Element"
          value={`${lunar.elementSymbol} ${lunar.element}`}
        />
        <InfoCell
          label="Next Full"
          value={lunar.nextFull}
        />
        <InfoCell
          label="Next New"
          value={lunar.nextNew}
        />
        <InfoCell
          label="Void of Course"
          value={lunar.voidOfCourse}
          colSpan
        />
      </div>
    </Panel>
  );
});

function InfoCell({
  label,
  value,
  colSpan,
}: {
  label: string;
  value: string;
  colSpan?: boolean;
}) {
  return (
    <div
      style={
        colSpan ? { gridColumn: "span 2", textAlign: "center" } : undefined
      }
    >
      <p className="data-label">{label}</p>
      <p
        className="data-value mt-0.5"
        style={{ fontSize: "clamp(12px, 0.9vw, 15px)" }}
      >
        {value}
      </p>
    </div>
  );
}
