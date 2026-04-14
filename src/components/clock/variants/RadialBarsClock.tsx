"use client";

import { useEffect, useRef } from "react";
import { readClockPalette, alpha } from "./clockPalette";

interface Props {
  size?: number;
}

/** Three concentric arcs showing fraction of hour/minute/second elapsed. */
export function RadialBarsClock({ size = 220 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    let animId = 0;

    function draw() {
      const p = readClockPalette();
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      const hFrac = (h + m / 60) / 12;
      const mFrac = (m + s / 60) / 60;
      const sFrac = (s + ms / 1000) / 60;

      const cx = size / 2;
      const cy = size / 2;
      const rOuter = size / 2 - 10;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);

      const stroke = Math.max(size * 0.04, 6);
      const gap = stroke * 0.6;
      const r3 = rOuter;
      const r2 = r3 - stroke - gap;
      const r1 = r2 - stroke - gap;

      // Track + progress arcs
      drawArc(ctx!, cx, cy, r3, alpha(p.secondHand, 0.15), stroke, 1);
      drawArc(ctx!, cx, cy, r3, p.secondHand, stroke, sFrac);

      drawArc(ctx!, cx, cy, r2, alpha(p.minuteHand, 0.15), stroke, 1);
      drawArc(ctx!, cx, cy, r2, p.minuteHand, stroke, mFrac);

      drawArc(ctx!, cx, cy, r1, alpha(p.hourHand, 0.15), stroke, 1);
      drawArc(ctx!, cx, cy, r1, p.accent, stroke, hFrac);

      // Centre digital readout
      ctx!.save();
      ctx!.fillStyle = p.textPrimary;
      ctx!.font = `300 ${r1 * 0.45}px var(--font-mono), monospace`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      const hh = pad(now.getHours());
      const mm = pad(now.getMinutes());
      ctx!.fillText(`${hh}:${mm}`, cx, cy - r1 * 0.08);
      ctx!.fillStyle = p.textSecondary;
      ctx!.font = `400 ${r1 * 0.18}px var(--font-mono), monospace`;
      ctx!.fillText(`:${pad(s)}`, cx, cy + r1 * 0.28);
      ctx!.restore();

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function drawArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  colour: string,
  width: number,
  fraction: number,
) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  const start = -Math.PI / 2;
  const end = start + Math.PI * 2 * Math.max(0, Math.min(1, fraction));
  ctx.arc(cx, cy, r, start, end);
  ctx.stroke();
  ctx.restore();
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
