"use client";

import { useEffect, useRef } from "react";

interface MoonPhaseProps {
  /** 0–1, fraction of disc illuminated */
  illumination: number;
  /** 0–1 where 0 = new moon, 0.5 = full moon, 1 = next new moon */
  phase: number;
  /** CSS display diameter in px */
  size?: number;
}

/* ── Seeded RNG for reproducible placement ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── High-res moon texture ── */
function createMoonTexture(texSize: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = texSize;
  const ctx = c.getContext("2d")!;
  const cx = texSize / 2;
  const cy = texSize / 2;
  const r = texSize / 2;

  // Base sphere gradient — highlight offset upper-left for 3D shape
  const base = ctx.createRadialGradient(
    cx - r * 0.18, cy - r * 0.12, r * 0.04,
    cx, cy, r,
  );
  base.addColorStop(0, "#dddae8");
  base.addColorStop(0.15, "#ccc8da");
  base.addColorStop(0.35, "#b4b0c4");
  base.addColorStop(0.55, "#9a96a8");
  base.addColorStop(0.72, "#7e7a8c");
  base.addColorStop(0.88, "#5c586a");
  base.addColorStop(1, "#38344a");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Maria — large dark mare patches (realistic lunar positions)
  const maria = [
    // Mare Imbrium (large, upper-left)
    { x: 0.34, y: 0.30, rx: 0.16, ry: 0.14, a: 0.25 },
    // Oceanus Procellarum (large, left)
    { x: 0.24, y: 0.48, rx: 0.15, ry: 0.22, a: 0.2 },
    // Mare Serenitatis (upper-mid)
    { x: 0.53, y: 0.28, rx: 0.09, ry: 0.10, a: 0.22 },
    // Mare Tranquillitatis (centre-right)
    { x: 0.58, y: 0.42, rx: 0.11, ry: 0.10, a: 0.2 },
    // Mare Crisium (right)
    { x: 0.72, y: 0.32, rx: 0.06, ry: 0.07, a: 0.24 },
    // Mare Nubium (lower-left)
    { x: 0.38, y: 0.64, rx: 0.10, ry: 0.08, a: 0.18 },
    // Mare Fecunditatis (lower-right)
    { x: 0.65, y: 0.56, rx: 0.08, ry: 0.07, a: 0.16 },
    // Mare Humorum (lower-far-left)
    { x: 0.28, y: 0.70, rx: 0.06, ry: 0.06, a: 0.18 },
  ];

  for (const m of maria) {
    const mx = cx - r + m.x * 2 * r;
    const my = cy - r + m.y * 2 * r;
    const mr = Math.max(m.rx, m.ry) * r * 1.6;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
    g.addColorStop(0, `rgba(18, 14, 34, ${m.a})`);
    g.addColorStop(0.4, `rgba(18, 14, 34, ${m.a * 0.55})`);
    g.addColorStop(0.75, `rgba(18, 14, 34, ${m.a * 0.15})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Prominent craters — 18 specific spots with visible rims
  const rng = seededRandom(42);
  const craters = [
    { x: 0.26, y: 0.18, s: 0.045 },
    { x: 0.72, y: 0.60, s: 0.055 },
    { x: 0.50, y: 0.78, s: 0.050 },
    { x: 0.18, y: 0.55, s: 0.035 },
    { x: 0.82, y: 0.45, s: 0.040 },
    { x: 0.40, y: 0.85, s: 0.045 },
    { x: 0.60, y: 0.15, s: 0.035 },
    { x: 0.35, y: 0.50, s: 0.030 },
    { x: 0.75, y: 0.20, s: 0.038 },
    { x: 0.55, y: 0.65, s: 0.042 },
    { x: 0.30, y: 0.38, s: 0.028 },
    { x: 0.68, y: 0.72, s: 0.032 },
    { x: 0.45, y: 0.22, s: 0.025 },
    { x: 0.15, y: 0.38, s: 0.030 },
    { x: 0.80, y: 0.55, s: 0.028 },
    { x: 0.42, y: 0.70, s: 0.033 },
    { x: 0.62, y: 0.35, s: 0.025 },
    { x: 0.50, y: 0.50, s: 0.022 },
  ];

  for (const cr of craters) {
    const crx = cx - r + cr.x * 2 * r;
    const cry = cy - r + cr.y * 2 * r;
    const crr = cr.s * r * 2;

    // Dark crater interior
    const cg = ctx.createRadialGradient(crx, cry, 0, crx, cry, crr);
    cg.addColorStop(0, "rgba(16, 12, 30, 0.18)");
    cg.addColorStop(0.5, "rgba(16, 12, 30, 0.08)");
    cg.addColorStop(1, "transparent");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(crx, cry, crr, 0, Math.PI * 2);
    ctx.fill();

    // Bright rim highlight (upper-left)
    const rimG = ctx.createRadialGradient(
      crx - crr * 0.3, cry - crr * 0.3, 0,
      crx, cry, crr * 1.1,
    );
    rimG.addColorStop(0, "rgba(220, 216, 236, 0.08)");
    rimG.addColorStop(0.4, "rgba(220, 216, 236, 0.03)");
    rimG.addColorStop(1, "transparent");
    ctx.fillStyle = rimG;
    ctx.beginPath();
    ctx.arc(crx, cry, crr * 1.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Surface grain — many tiny semi-transparent dots for texture
  for (let i = 0; i < 800; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * r * 0.92;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const sr = 1 + rng() * 4;
    const op = 0.01 + rng() * 0.035;
    const bright = rng() > 0.5;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(
      0,
      bright ? `rgba(220, 216, 236, ${op * 0.6})` : `rgba(12, 10, 28, ${op})`,
    );
    sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Limb darkening — strong edge falloff
  const v = ctx.createRadialGradient(cx, cy, r * 0.1, cx, cy, r);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.45, "rgba(0,0,0,0)");
  v.addColorStop(0.7, "rgba(0,0,0,0.08)");
  v.addColorStop(0.85, "rgba(0,0,0,0.25)");
  v.addColorStop(0.95, "rgba(0,0,0,0.5)");
  v.addColorStop(1, "rgba(0,0,0,0.7)");
  ctx.fillStyle = v;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

// Module-level texture cache — shared across instances, created once
let cachedTexture: HTMLCanvasElement | null = null;

function getTexture(): HTMLCanvasElement {
  if (!cachedTexture) {
    cachedTexture = createMoonTexture(512);
  }
  return cachedTexture;
}

/**
 * High-resolution canvas moon.
 *
 * The canvas repaints only when phase/illumination data changes (~hourly).
 * The ambient breathing glow is pure CSS animation — no per-frame draws.
 */
export function MoonPhase({ illumination, phase, size = 200 }: MoonPhaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    const renderSize = Math.max(400, size * dpr);
    canvas.width = renderSize;
    canvas.height = renderSize;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const r = renderSize / 2;
    const cx = r;
    const cy = r;

    ctx.clearRect(0, 0, renderSize, renderSize);

    // ── Moon texture ──
    const moonTex = getTexture();
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(moonTex, 0, 0, renderSize, renderSize);
    ctx.restore();

    // ── Terminator (shadow) ──
    const pa = phase * Math.PI * 2;
    const k = Math.cos(pa);
    const isWax = Math.sin(pa) >= 0;
    const steps = 120;

    // Soft penumbral gradient (~15px at render scale)
    const penumbraLayers = [
      { o: 0.07, a: 0.06 },
      { o: 0.04, a: 0.18 },
      { o: 0.02, a: 0.38 },
      { o: 0.008, a: 0.6 },
    ];

    for (const pp of penumbraLayers) {
      const pk = k + (isWax ? -1 : 1) * pp.o;
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, isWax);
      for (let i = 0; i <= steps; i++) {
        const a = Math.PI / 2 - (i / steps) * Math.PI;
        ctx.lineTo(cx + pk * r * Math.cos(a), cy + r * Math.sin(a));
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(6, 6, 26, ${pp.a})`;
      ctx.fill();
      ctx.restore();
    }

    // Hard shadow core
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, isWax);
    for (let i = 0; i <= steps; i++) {
      const a = Math.PI / 2 - (i / steps) * Math.PI;
      ctx.lineTo(cx + k * r * Math.cos(a), cy + r * Math.sin(a));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(6, 6, 26, 0.97)";
    ctx.fill();
    ctx.restore();

    // ── Earthshine — faint edge outline on the dark side ──
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.clip();

    // Faint glow on dark hemisphere
    if (illumination < 0.5) {
      const esx = isWax ? cx - r * 0.35 : cx + r * 0.35;
      const esg = ctx.createRadialGradient(esx, cy, r * 0.3, cx, cy, r);
      const esi = (0.5 - illumination) * 0.05;
      esg.addColorStop(0, `rgba(110, 130, 185, ${esi})`);
      esg.addColorStop(0.5, `rgba(80, 100, 155, ${esi * 0.3})`);
      esg.addColorStop(1, "transparent");
      ctx.fillStyle = esg;
      ctx.fillRect(0, 0, renderSize, renderSize);
    }

    // Faint edge ring — full sphere barely visible at 3-4% opacity
    ctx.beginPath();
    ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(180, 190, 220, ${0.03 + illumination * 0.01})`;
    ctx.lineWidth = renderSize * 0.004;
    ctx.stroke();
    ctx.restore();

    // ── Bright limb on lit side ──
    ctx.beginPath();
    ctx.arc(cx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220, 218, 240, ${0.05 + illumination * 0.08})`;
    ctx.lineWidth = renderSize * 0.003;
    ctx.stroke();
  }, [phase, illumination, size]);

  // Glow size: 1.5× moon diameter
  const glowSize = size * 1.5;
  const glowOffset = (glowSize - size) / 2;

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
      }}
    >
      {/* CSS ambient glow — breathing animation, no canvas repaints */}
      <div
        style={{
          position: "absolute",
          top: -glowOffset,
          left: -glowOffset,
          width: glowSize,
          height: glowSize,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(210, 206, 230, ${0.08 + illumination * 0.04}) 0%, rgba(200, 196, 220, ${0.02 + illumination * 0.02}) 40%, transparent 70%)`,
          animation: "moonBreathe 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      {/* Gold warmth glow near full moon */}
      {illumination > 0.3 && (
        <div
          style={{
            position: "absolute",
            top: -glowOffset,
            left: -glowOffset,
            width: glowSize,
            height: glowSize,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(232, 201, 122, ${0.03 * ((illumination - 0.3) / 0.7)}) 0%, transparent 60%)`,
            animation: "moonBreathe 6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-label={`Moon phase: ${Math.round(illumination * 100)}% illuminated`}
        style={{
          display: "block",
          width: size,
          height: size,
        }}
      />
    </div>
  );
}
