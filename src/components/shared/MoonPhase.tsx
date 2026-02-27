"use client";

import { useEffect, useRef } from "react";

interface MoonPhaseProps {
  /** 0–1, fraction of disc illuminated */
  illumination: number;
  /** 0–1 where 0 = new moon, 0.5 = full moon, 1 = next new moon */
  phase: number;
  /** Diameter in px */
  size?: number;
}

/**
 * Realistic moon rendered on canvas with layered surface texture,
 * soft terminator, ambient glow with breathing animation.
 */
export function MoonPhase({ illumination, phase, size = 130 }: MoonPhaseProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    // Canvas needs extra space for the ambient glow (2x radius)
    const glowPad = size * 0.6;
    const totalSize = size + glowPad * 2;

    canvas.width = totalSize * dpr;
    canvas.height = totalSize * dpr;
    canvas.style.width = `${totalSize}px`;
    canvas.style.height = `${totalSize}px`;

    const cx = totalSize / 2;
    const cy = totalSize / 2;
    const moonR = size / 2;

    // Seeded pseudo-random for consistent crater placement
    function seededRandom(seed: number) {
      let s = seed;
      return () => {
        s = (s * 16807 + 0) % 2147483647;
        return s / 2147483647;
      };
    }

    // Pre-generate crater positions (consistent across frames)
    const rng = seededRandom(42);
    const craters: { x: number; y: number; r: number; depth: number }[] = [];
    // Large mare (dark patches)
    for (let i = 0; i < 6; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * moonR * 0.6;
      craters.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: moonR * (0.15 + rng() * 0.2),
        depth: 0.12 + rng() * 0.08,
      });
    }
    // Medium craters
    for (let i = 0; i < 12; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * moonR * 0.85;
      craters.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: moonR * (0.04 + rng() * 0.08),
        depth: 0.06 + rng() * 0.06,
      });
    }
    // Small craters
    for (let i = 0; i < 20; i++) {
      const angle = rng() * Math.PI * 2;
      const dist = rng() * moonR * 0.92;
      craters.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        r: moonR * (0.015 + rng() * 0.03),
        depth: 0.03 + rng() * 0.04,
      });
    }

    function draw() {
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, totalSize, totalSize);

      // --- Breathing glow animation ---
      const time = Date.now() / 1000;
      const breathe = 0.85 + 0.15 * Math.sin(time * 0.8); // Slow breathing

      // --- Ambient glow (2x radius) ---
      const glowR = moonR * 2;
      const glowAlpha = 0.08 * breathe * Math.max(0.3, illumination);
      const ambientGlow = ctx!.createRadialGradient(cx, cy, moonR * 0.8, cx, cy, glowR);
      ambientGlow.addColorStop(0, `rgba(230, 235, 255, ${glowAlpha})`);
      ambientGlow.addColorStop(0.4, `rgba(200, 210, 240, ${glowAlpha * 0.5})`);
      ambientGlow.addColorStop(1, "rgba(200, 210, 240, 0)");
      ctx!.fillStyle = ambientGlow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, glowR, 0, Math.PI * 2);
      ctx!.fill();

      // --- Clip to moon disc ---
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx!.clip();

      // --- Base surface: dark side ---
      const baseSurface = ctx!.createRadialGradient(
        cx - moonR * 0.2, cy - moonR * 0.15, moonR * 0.1,
        cx, cy, moonR
      );
      baseSurface.addColorStop(0, "rgb(35, 38, 48)");
      baseSurface.addColorStop(0.5, "rgb(25, 27, 35)");
      baseSurface.addColorStop(1, "rgb(18, 20, 28)");
      ctx!.fillStyle = baseSurface;
      ctx!.fillRect(cx - moonR, cy - moonR, moonR * 2, moonR * 2);

      // --- Surface texture: mare (dark patches) and highlands ---
      for (const crater of craters) {
        const cg = ctx!.createRadialGradient(
          crater.x, crater.y, 0,
          crater.x, crater.y, crater.r
        );
        cg.addColorStop(0, `rgba(15, 18, 25, ${crater.depth})`);
        cg.addColorStop(0.6, `rgba(20, 22, 30, ${crater.depth * 0.6})`);
        cg.addColorStop(1, "rgba(20, 22, 30, 0)");
        ctx!.fillStyle = cg;
        ctx!.beginPath();
        ctx!.arc(crater.x, crater.y, crater.r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Highland highlights (lighter patches) ---
      const hlRng = seededRandom(99);
      for (let i = 0; i < 8; i++) {
        const angle = hlRng() * Math.PI * 2;
        const dist = hlRng() * moonR * 0.7;
        const hx = cx + Math.cos(angle) * dist;
        const hy = cy + Math.sin(angle) * dist;
        const hr = moonR * (0.08 + hlRng() * 0.12);

        const hg = ctx!.createRadialGradient(hx, hy, 0, hx, hy, hr);
        hg.addColorStop(0, `rgba(60, 65, 80, ${0.08 + hlRng() * 0.06})`);
        hg.addColorStop(1, "rgba(60, 65, 80, 0)");
        ctx!.fillStyle = hg;
        ctx!.beginPath();
        ctx!.arc(hx, hy, hr, 0, Math.PI * 2);
        ctx!.fill();
      }

      // --- Illumination: terminator with soft gradient ---
      // phase 0→0.5 = waxing (right side lit), 0.5→1 = waning (left side lit)
      const sweep = Math.cos(phase * 2 * Math.PI);
      const rightLit = phase <= 0.5;

      // Draw illumination as a gradient overlay
      // We'll draw the lit portion by creating a mask effect
      // The terminator position is determined by the sweep factor
      const litCx = cx + sweep * moonR * 0.5;

      // Create a wide gradient for the illuminated area
      const terminatorWidth = moonR * 0.15; // Soft edge width

      // Draw illumination using vertical strips for smooth terminator
      const steps = 100;
      for (let i = 0; i < steps; i++) {
        const x = cx - moonR + (i / steps) * moonR * 2;
        const stripW = (moonR * 2) / steps + 1;

        // Calculate how lit this x position is
        // Normalise x position relative to centre: -1 (left) to 1 (right)
        const nx = (x - cx) / moonR;

        // The terminator position on the normalised scale
        let litAmount: number;
        if (rightLit) {
          // Right side lit: lit when nx > sweep threshold
          litAmount = smoothstep(sweep - 0.15, sweep + 0.15, nx);
        } else {
          // Left side lit: lit when nx < -sweep threshold
          litAmount = smoothstep(sweep + 0.15, sweep - 0.15, nx);
        }

        if (litAmount <= 0) continue;

        // Lit colour: warm cream white
        const alpha = litAmount * 0.85;
        ctx!.fillStyle = `rgba(240, 235, 215, ${alpha})`;
        ctx!.fillRect(x, cy - moonR, stripW, moonR * 2);
      }

      // --- Crater shadows on lit side (subtle depth) ---
      for (const crater of craters) {
        const nx = (crater.x - cx) / moonR;
        let litAmount: number;
        if (rightLit) {
          litAmount = smoothstep(sweep - 0.15, sweep + 0.15, nx);
        } else {
          litAmount = smoothstep(sweep + 0.15, sweep - 0.15, nx);
        }

        if (litAmount > 0.3) {
          // Subtle shadow on lit craters for depth
          const shadowAlpha = litAmount * crater.depth * 0.5;
          const sg = ctx!.createRadialGradient(
            crater.x - crater.r * 0.2, crater.y - crater.r * 0.2, 0,
            crater.x, crater.y, crater.r * 0.8
          );
          sg.addColorStop(0, `rgba(180, 170, 145, ${shadowAlpha})`);
          sg.addColorStop(0.5, `rgba(120, 115, 95, ${shadowAlpha * 0.4})`);
          sg.addColorStop(1, "rgba(120, 115, 95, 0)");
          ctx!.fillStyle = sg;
          ctx!.beginPath();
          ctx!.arc(crater.x, crater.y, crater.r * 0.8, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      // --- Limb darkening (edge of moon is darker) ---
      const limbDark = ctx!.createRadialGradient(cx, cy, moonR * 0.5, cx, cy, moonR);
      limbDark.addColorStop(0, "rgba(0, 0, 0, 0)");
      limbDark.addColorStop(0.7, "rgba(0, 0, 0, 0)");
      limbDark.addColorStop(1, "rgba(0, 0, 0, 0.35)");
      ctx!.fillStyle = limbDark;
      ctx!.beginPath();
      ctx!.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.restore(); // Unclip

      // --- Thin ring around moon edge ---
      ctx!.beginPath();
      ctx!.arc(cx, cy, moonR, 0, Math.PI * 2);
      ctx!.strokeStyle = `rgba(200, 210, 230, ${0.08 * breathe})`;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();

      animRef.current = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [illumination, phase, size]);

  const glowPad = size * 0.6;
  const totalSize = size + glowPad * 2;

  return (
    <canvas
      ref={canvasRef}
      aria-label={`Moon phase: ${Math.round(illumination * 100)}% illuminated`}
      style={{
        width: totalSize,
        height: totalSize,
        // Offset the glow padding so the moon itself aligns as expected
        margin: -glowPad,
      }}
    />
  );
}

/** Smooth interpolation between edges — GLSL-style smoothstep */
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}
