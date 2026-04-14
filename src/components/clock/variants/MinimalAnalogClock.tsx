"use client";

import { useEffect, useRef } from "react";
import { readClockPalette, alpha } from "./clockPalette";

interface Props {
  size?: number;
}

export function MinimalAnalogClock({ size = 220 }: Props) {
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

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;
    let animId = 0;

    function draw() {
      const p = readClockPalette();
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();
      const secAngle = ((s + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
      const minAngle = ((m + s / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      const hourAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);

      // Single outer hairline ring
      ctx!.save();
      ctx!.strokeStyle = alpha(p.ring, 0.35);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // 12 long ticks + 60 faint ticks
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const innerR = isHour ? r - 14 : r - 6;
        const outer = r - 2;
        ctx!.save();
        ctx!.strokeStyle = isHour ? p.tickMajor : alpha(p.tickMinor, 0.4);
        ctx!.lineWidth = isHour ? 1.2 : 0.6;
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
        ctx!.lineTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx!.stroke();
        ctx!.restore();
      }

      drawHand(ctx!, cx, cy, hourAngle, r * 0.5, 3, p.hourHand);
      drawHand(ctx!, cx, cy, minAngle, r * 0.72, 2, p.minuteHand);
      drawHand(ctx!, cx, cy, secAngle, r * 0.8, 1, p.secondHand);

      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx!.fillStyle = p.centreDot;
      ctx!.fill();
      ctx!.restore();

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function drawHand(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  length: number,
  width: number,
  colour: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.restore();
}
