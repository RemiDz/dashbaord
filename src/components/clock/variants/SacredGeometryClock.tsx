"use client";

import { useEffect, useRef } from "react";
import { readClockPalette, alpha } from "./clockPalette";

interface Props {
  size?: number;
}

/**
 * Flower-of-life inspired clock.
 * Twelve petals on the rim glow according to the hour. The currently
 * elapsed minute petal pulses. Seconds pulse the central vesica.
 */
export function SacredGeometryClock({ size = 220 }: Props) {
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

      const cx = size / 2;
      const cy = size / 2;
      const baseR = size / 2 - 8;
      const pulse = 0.5 + 0.5 * Math.sin((s + ms / 1000) * Math.PI);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);

      // Outer circle
      ctx!.save();
      ctx!.strokeStyle = alpha(p.accent, 0.35);
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(cx, cy, baseR, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // 12 overlapping circles — classic seed-of-life
      const petalR = baseR * 0.42;
      const ringR = baseR - petalR;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const px = cx + Math.cos(a) * ringR;
        const py = cy + Math.sin(a) * ringR;
        const isCurrentHour = i === h;
        const isCurrentMinutePetal = i === Math.floor(m / 5);
        const colour = isCurrentHour
          ? alpha(p.accent, 0.8)
          : isCurrentMinutePetal
            ? alpha(p.secondHand, 0.55 + pulse * 0.25)
            : alpha(p.moonsilver, 0.18);
        ctx!.save();
        ctx!.strokeStyle = colour;
        ctx!.lineWidth = isCurrentHour ? 1.8 : 0.9;
        ctx!.beginPath();
        ctx!.arc(px, py, petalR, 0, Math.PI * 2);
        ctx!.stroke();
        if (isCurrentHour) {
          ctx!.fillStyle = alpha(p.accent, 0.1);
          ctx!.fill();
        }
        ctx!.restore();
      }

      // Central vesica — pulses with seconds
      ctx!.save();
      const centralColour = alpha(p.accent, 0.4 + pulse * 0.3);
      ctx!.strokeStyle = centralColour;
      ctx!.lineWidth = 1.4 + pulse * 0.6;
      ctx!.beginPath();
      ctx!.arc(cx, cy, petalR, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // Twelve radial ticks (hour markers) with numerals
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const tx = cx + Math.cos(a) * (baseR - 2);
        const ty = cy + Math.sin(a) * (baseR - 2);
        ctx!.save();
        ctx!.fillStyle = i === h ? p.accent : alpha(p.tickMajor, 0.5);
        ctx!.beginPath();
        ctx!.arc(tx, ty, 1.8, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      // Hour/minute hands — subtle
      const minAngle = ((m + s / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      const hourAngle = ((h + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
      drawHand(ctx!, cx, cy, hourAngle, baseR * 0.42, 2, alpha(p.accent, 0.9));
      drawHand(ctx!, cx, cy, minAngle, baseR * 0.66, 1.2, alpha(p.hourHand, 0.75));

      // Central glow dot
      ctx!.save();
      const glow = ctx!.createRadialGradient(cx, cy, 0, cx, cy, 8);
      glow.addColorStop(0, p.accent);
      glow.addColorStop(1, alpha(p.accent, 0));
      ctx!.fillStyle = glow;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 8, 0, Math.PI * 2);
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
  ctx.moveTo(-length * 0.12, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.restore();
}
