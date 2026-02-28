"use client";

import { useEffect, useRef, useCallback } from "react";

interface MoonPhaseProps {
  /** 0–1, fraction of disc illuminated */
  illumination: number;
  /** 0–1 where 0 = new moon, 0.5 = full moon, 1 = next new moon */
  phase: number;
  /** Diameter in px */
  size?: number;
}

/* ── Seeded RNG for reproducible crater placement ── */
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ── Pre-rendered moon texture (copied from Lunata's MoonCanvas) ── */
function createMoonTexture(texSize: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = texSize;
  const ctx = c.getContext("2d")!;
  const cx = texSize / 2;
  const cy = texSize / 2;
  const r = texSize / 2;

  // Base sphere gradient — highlight offset upper-left
  const base = ctx.createRadialGradient(
    cx - r * 0.15, cy - r * 0.1, r * 0.05,
    cx, cy, r,
  );
  base.addColorStop(0, "#d8d4e4");
  base.addColorStop(0.2, "#c4c0d2");
  base.addColorStop(0.45, "#a8a4b6");
  base.addColorStop(0.65, "#8c889a");
  base.addColorStop(0.82, "#6c687a");
  base.addColorStop(1, "#3c3848");
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // Maria — 8 positioned dark mare patches (realistic positions)
  const maria = [
    { x: 0.34, y: 0.30, rx: 0.14, ry: 0.12, a: 0.2 },
    { x: 0.26, y: 0.48, rx: 0.13, ry: 0.20, a: 0.16 },
    { x: 0.53, y: 0.30, rx: 0.08, ry: 0.09, a: 0.18 },
    { x: 0.57, y: 0.43, rx: 0.10, ry: 0.09, a: 0.17 },
    { x: 0.72, y: 0.33, rx: 0.05, ry: 0.065, a: 0.2 },
    { x: 0.40, y: 0.62, rx: 0.09, ry: 0.07, a: 0.14 },
    { x: 0.64, y: 0.56, rx: 0.07, ry: 0.06, a: 0.12 },
    { x: 0.30, y: 0.68, rx: 0.05, ry: 0.05, a: 0.14 },
  ];
  for (const m of maria) {
    const mx = cx - r + m.x * 2 * r;
    const my = cy - r + m.y * 2 * r;
    const mr = Math.max(m.rx, m.ry) * r * 1.4;
    const g = ctx.createRadialGradient(mx, my, 0, mx, my, mr);
    g.addColorStop(0, `rgba(20,16,36,${m.a})`);
    g.addColorStop(0.5, `rgba(20,16,36,${m.a * 0.5})`);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro texture — 500 procedural craters
  const rng = seededRandom(42);
  for (let i = 0; i < 500; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = rng() * r * 0.9;
    const sx = cx + Math.cos(angle) * dist;
    const sy = cy + Math.sin(angle) * dist;
    const sr = 2 + rng() * 6;
    const op = 0.015 + rng() * 0.03;
    const dark = rng() > 0.45;
    const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
    sg.addColorStop(
      0,
      dark ? `rgba(12,10,28,${op})` : `rgba(210,206,228,${op * 0.5})`,
    );
    sg.addColorStop(1, "transparent");
    ctx.fillStyle = sg;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Limb darkening
  const v = ctx.createRadialGradient(cx, cy, r * 0.12, cx, cy, r);
  v.addColorStop(0, "rgba(0,0,0,0)");
  v.addColorStop(0.5, "rgba(0,0,0,0)");
  v.addColorStop(0.75, "rgba(0,0,0,0.1)");
  v.addColorStop(0.9, "rgba(0,0,0,0.35)");
  v.addColorStop(1, "rgba(0,0,0,0.6)");
  ctx.fillStyle = v;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  return c;
}

/**
 * Realistic moon rendered on canvas — matched to Lunata's MoonCanvas.
 *
 * Features: pre-rendered 512px texture with maria and craters,
 * 4-layer penumbral terminator, earthshine, gold warmth near full,
 * 3-layer breathing glow with frame counter, bright limb outline.
 */
export function MoonPhase({ illumination, phase, size = 200 }: MoonPhaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const moonTexRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const glowPad = size * 0.5;
    const totalSize = size + glowPad * 2;

    // Only resize if needed
    const expectedW = Math.round(totalSize * dpr);
    if (canvas.width !== expectedW) {
      canvas.width = expectedW;
      canvas.height = expectedW;
      canvas.style.width = `${totalSize}px`;
      canvas.style.height = `${totalSize}px`;
      ctx.scale(dpr, dpr);
    }

    const f = frameRef.current++;
    const moonTex = moonTexRef.current;
    const r = size / 2;
    const cx = totalSize / 2;
    const cy = totalSize / 2;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, totalSize, totalSize);

    // ── Breathing glow (3 concentric layers) ──
    const breathe = Math.sin(f * 0.005) * 0.05 + 0.95;
    const glowLayers = [
      { m: 2.2, o: 0.01 },
      { m: 1.7, o: 0.025 },
      { m: 1.35, o: 0.05 },
    ];
    for (const l of glowLayers) {
      const g = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * l.m);
      const op = l.o * illumination * breathe;
      g.addColorStop(0, `rgba(200,196,220,${op})`);
      g.addColorStop(0.5, `rgba(190,185,215,${op * 0.3})`);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, r * l.m, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Gold warmth near full ──
    if (illumination > 0.3) {
      const gi = ((illumination - 0.3) / 0.7) * breathe;
      const gg = ctx.createRadialGradient(cx, cy, r, cx, cy, r * 1.9);
      gg.addColorStop(0, `rgba(232,201,122,${0.025 * gi})`);
      gg.addColorStop(0.5, `rgba(232,201,122,${0.008 * gi})`);
      gg.addColorStop(1, "transparent");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.9, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Moon texture ──
    if (moonTex) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(moonTex, cx - r, cy - r, r * 2, r * 2);
      ctx.restore();
    }

    // ── Terminator — 4 penumbral passes + hard shadow ──
    const pa = phase * Math.PI * 2;
    const k = Math.cos(pa);
    const isWax = Math.sin(pa) >= 0;
    const steps = 90;

    // Penumbral layers (soft terminator edge)
    for (const pp of [
      { o: 0.06, a: 0.08 },
      { o: 0.035, a: 0.2 },
      { o: 0.015, a: 0.4 },
      { o: 0.005, a: 0.65 },
    ]) {
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
      ctx.fillStyle = `rgba(6,6,26,${pp.a})`;
      ctx.fill();
      ctx.restore();
    }

    // Hard shadow
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
    ctx.fillStyle = "rgba(6,6,26,0.97)";
    ctx.fill();
    ctx.restore();

    // ── Earthshine (faint blue on dark side near new moon) ──
    if (illumination < 0.4) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      const esx = isWax ? cx - r * 0.4 : cx + r * 0.4;
      const esg = ctx.createRadialGradient(esx, cy, r * 0.2, cx, cy, r);
      const esi = (0.4 - illumination) * 0.04;
      esg.addColorStop(0, `rgba(110,130,185,${esi})`);
      esg.addColorStop(0.5, `rgba(80,100,155,${esi * 0.2})`);
      esg.addColorStop(1, "transparent");
      ctx.fillStyle = esg;
      ctx.fillRect(0, 0, totalSize, totalSize);
      ctx.restore();
    }

    // ── Bright limb ──
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(220,218,240,${0.06 + illumination * 0.06})`;
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.restore();
    rafRef.current = requestAnimationFrame(draw);
  }, [phase, illumination, size]);

  useEffect(() => {
    if (!moonTexRef.current) {
      moonTexRef.current = createMoonTexture(512);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  const glowPad = size * 0.5;
  const totalSize = size + glowPad * 2;

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Moon phase: ${Math.round(illumination * 100)}% illuminated`}
      style={{
        width: totalSize,
        height: totalSize,
        margin: -glowPad,
      }}
    />
  );
}
