"use client";

import { useEffect, useRef } from "react";
import { readClockPalette, alpha } from "./clockPalette";

const NUMERALS = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

interface Props {
  size?: number;
}

export function RomanMarbleClock({ size = 220 }: Props) {
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

      // Marble face — warm gradient
      ctx!.save();
      const marbleGrad = ctx!.createRadialGradient(cx - r * 0.25, cy - r * 0.25, 0, cx, cy, r);
      marbleGrad.addColorStop(0, alpha(p.textPrimary, 0.16));
      marbleGrad.addColorStop(0.55, alpha(p.textPrimary, 0.06));
      marbleGrad.addColorStop(1, alpha(p.bgInner, 0.9));
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.fillStyle = marbleGrad;
      ctx!.fill();
      ctx!.restore();

      // Faux marble veining using thin low-alpha sine strokes
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r - 1, 0, Math.PI * 2);
      ctx!.clip();
      ctx!.strokeStyle = alpha(p.moonsilver, 0.09);
      ctx!.lineWidth = 0.8;
      for (let v = 0; v < 6; v++) {
        ctx!.beginPath();
        for (let x = -r; x < r; x += 3) {
          const y = Math.sin((x + v * 9) * 0.05) * 2 + v * 7 - r * 0.6;
          if (x === -r) ctx!.moveTo(cx + x, cy + y);
          else ctx!.lineTo(cx + x, cy + y);
        }
        ctx!.stroke();
      }
      ctx!.restore();

      // Double ring
      ctx!.save();
      ctx!.strokeStyle = alpha(p.accent, 0.6);
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.strokeStyle = alpha(p.accent, 0.3);
      ctx!.lineWidth = 0.8;
      ctx!.beginPath();
      ctx!.arc(cx, cy, r - 6, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.restore();

      // Roman numerals — large serif
      ctx!.save();
      ctx!.font = `700 ${r * 0.17}px "Cinzel", "Playfair Display", serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = p.accent;
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const numR = r * 0.78;
        const x = cx + Math.cos(a) * numR;
        const y = cy + Math.sin(a) * numR;
        ctx!.fillText(NUMERALS[i], x, y);
      }
      ctx!.restore();

      // Ornate hour hand — broad spade shape
      drawSpade(ctx!, cx, cy, hourAngle, r * 0.48, p.hourHand, p.accent);
      // Minute hand — long arrow
      drawArrow(ctx!, cx, cy, minAngle, r * 0.74, p.minuteHand);
      // Second hand — very thin
      drawHand(ctx!, cx, cy, secAngle, r * 0.82, 1, p.secondHand);

      // Central medallion
      ctx!.save();
      const medGrad = ctx!.createRadialGradient(cx - 2, cy - 2, 0, cx, cy, 8);
      medGrad.addColorStop(0, p.accent);
      medGrad.addColorStop(1, alpha(p.accent, 0.3));
      ctx!.fillStyle = medGrad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = alpha(p.accent, 0.8);
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.restore();

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function drawSpade(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  length: number,
  fill: string,
  outline: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -length);
  ctx.quadraticCurveTo(-4, -length * 0.55, -3.5, -length * 0.25);
  ctx.quadraticCurveTo(-6, -length * 0.15, -3.5, 0);
  ctx.lineTo(-2, length * 0.15);
  ctx.lineTo(2, length * 0.15);
  ctx.lineTo(3.5, 0);
  ctx.quadraticCurveTo(6, -length * 0.15, 3.5, -length * 0.25);
  ctx.quadraticCurveTo(4, -length * 0.55, 0, -length);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = outline;
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();
}

function drawArrow(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  length: number,
  colour: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);
  ctx.beginPath();
  ctx.moveTo(0, -length);
  ctx.lineTo(-2, -length + 10);
  ctx.lineTo(-1.2, -length + 10);
  ctx.lineTo(-1.2, 6);
  ctx.lineTo(1.2, 6);
  ctx.lineTo(1.2, -length + 10);
  ctx.lineTo(2, -length + 10);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
  ctx.restore();
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
  ctx.moveTo(-length * 0.15, 0);
  ctx.lineTo(length, 0);
  ctx.stroke();
  ctx.restore();
}
