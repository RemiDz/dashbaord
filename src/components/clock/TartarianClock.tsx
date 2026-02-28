"use client";

import { useEffect, useRef } from "react";

interface TartarianClockProps {
  size?: number;
}

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];

// Celestial observatory palette
const SILVER = "rgba(200, 196, 220, 0.85)";
const SILVER_DIM = "rgba(200, 196, 220, 0.5)";
const SILVER_FAINT = "rgba(200, 196, 220, 0.15)";
const BLUE_ACCENT = "rgba(120, 180, 255, 0.7)";
const SELENITE = "rgba(240, 238, 248, 0.9)";
const BG_VOID = "rgba(5, 5, 15, 0.9)";

export function TartarianClock({ size = 210 }: TartarianClockProps) {
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
    const r = size / 2 - 8; // Extra padding so nothing clips at card edges

    let animId: number;

    function draw() {
      const now = new Date();
      const h = now.getHours() % 12;
      const m = now.getMinutes();
      const s = now.getSeconds();
      const ms = now.getMilliseconds();

      // Smooth angles
      const secAngle = ((s + ms / 1000) / 60) * Math.PI * 2 - Math.PI / 2;
      const minAngle = ((m + s / 60) / 60) * Math.PI * 2 - Math.PI / 2;
      const hourAngle = ((h + m / 60 + s / 3600) / 12) * Math.PI * 2 - Math.PI / 2;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, size, size);

      // -- Background --
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      const bgGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
      bgGrad.addColorStop(0, "rgba(12, 12, 24, 0.95)");
      bgGrad.addColorStop(1, BG_VOID);
      ctx!.fillStyle = bgGrad;
      ctx!.fill();
      ctx!.restore();

      // -- Outer ring (2px) with subtle blue-silver glow --
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.strokeStyle = SILVER;
      ctx!.lineWidth = 2;
      ctx!.shadowColor = "rgba(160, 180, 255, 0.3)";
      ctx!.shadowBlur = 8;
      ctx!.stroke();
      ctx!.restore();

      // -- Inner ring (1px) --
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r - 5, 0, Math.PI * 2);
      ctx!.strokeStyle = SILVER_FAINT;
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.restore();

      // -- 60 minute tick marks --
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const isMajor = i % 15 === 0;
        const outerR = r - 7;
        const innerR = isMajor ? r - 20 : isHour ? r - 16 : r - 12;
        const lw = isMajor ? 2 : isHour ? 1.5 : 0.5;
        const col = isMajor ? SILVER : isHour ? SILVER_DIM : SILVER_FAINT;

        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx!.lineTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx!.strokeStyle = col;
        ctx!.lineWidth = lw;
        ctx!.stroke();
        ctx!.restore();
      }

      // -- Roman numerals (Cinzel) --
      ctx!.save();
      ctx!.font = `600 ${r * 0.13}px Cinzel, serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = "rgba(220, 230, 255, 0.85)";
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const numR = r * 0.76;
        const x = cx + Math.cos(angle) * numR;
        const y = cy + Math.sin(angle) * numR;
        ctx!.fillText(ROMAN[i], x, y);
      }
      ctx!.restore();

      // -- Hour hand: slim, selenite-white gradient --
      drawHourHand(ctx!, cx, cy, hourAngle, r);

      // -- Minute hand: slender, silver --
      drawMinuteHand(ctx!, cx, cy, minAngle, r);

      // -- Second hand: thin blue needle --
      drawSecondHand(ctx!, cx, cy, secAngle, r);

      // -- Centre pin with silver/white gradient --
      ctx!.save();
      const pinGrad = ctx!.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, 5);
      pinGrad.addColorStop(0, SELENITE);
      pinGrad.addColorStop(0.6, SILVER);
      pinGrad.addColorStop(1, "rgba(140, 140, 170, 0.9)");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 4.5, 0, Math.PI * 2);
      ctx!.fillStyle = pinGrad;
      ctx!.fill();
      // Pin highlight
      ctx!.beginPath();
      ctx!.arc(cx - 0.5, cy - 0.5, 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(240, 240, 255, 0.5)";
      ctx!.fill();
      ctx!.restore();

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}

// -------------------------------------------------------
// Hand drawing functions
// -------------------------------------------------------

function drawHourHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, r: number) {
  const length = r * 0.52;
  const tailLen = r * 0.1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  // Slim tapered body — no diamond accent
  ctx.beginPath();
  ctx.moveTo(0, -length);          // Tip
  ctx.lineTo(-3, -length * 0.3);   // Left shoulder
  ctx.lineTo(-2.5, 0);             // Left base
  ctx.lineTo(-1.5, tailLen);       // Left tail
  ctx.lineTo(1.5, tailLen);        // Right tail
  ctx.lineTo(2.5, 0);              // Right base
  ctx.lineTo(3, -length * 0.3);    // Right shoulder
  ctx.closePath();

  const handGrad = ctx.createLinearGradient(0, tailLen, 0, -length);
  handGrad.addColorStop(0, "rgba(160, 160, 190, 0.85)");
  handGrad.addColorStop(0.5, SELENITE);
  handGrad.addColorStop(1, SILVER);
  ctx.fillStyle = handGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 196, 220, 0.3)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function drawMinuteHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, r: number) {
  const length = r * 0.72;
  const tailLen = r * 0.12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  ctx.beginPath();
  ctx.moveTo(0, -length);            // Tip (pointed)
  ctx.lineTo(-2, -length * 0.15);    // Left taper
  ctx.lineTo(-1.5, 0);
  ctx.lineTo(-1, tailLen);
  ctx.lineTo(1, tailLen);
  ctx.lineTo(1.5, 0);
  ctx.lineTo(2, -length * 0.15);
  ctx.closePath();

  const mGrad = ctx.createLinearGradient(0, tailLen, 0, -length);
  mGrad.addColorStop(0, "rgba(160, 160, 190, 0.8)");
  mGrad.addColorStop(1, SILVER);
  ctx.fillStyle = mGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(200, 196, 220, 0.25)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function drawSecondHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, r: number) {
  const length = r * 0.8;
  const tailLen = r * 0.2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  // Thin blue needle
  ctx.beginPath();
  ctx.moveTo(0, -length);
  ctx.lineTo(-0.5, 0);
  ctx.lineTo(0.5, 0);
  ctx.closePath();
  ctx.fillStyle = BLUE_ACCENT;
  ctx.fill();

  // Small counterweight circle
  ctx.beginPath();
  ctx.arc(0, tailLen * 0.7, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = BLUE_ACCENT;
  ctx.fill();

  // Counterweight tail line
  ctx.beginPath();
  ctx.moveTo(-0.5, 0);
  ctx.lineTo(-0.8, tailLen);
  ctx.lineTo(0.8, tailLen);
  ctx.lineTo(0.5, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(120, 180, 255, 0.4)";
  ctx.fill();

  ctx.restore();
}
