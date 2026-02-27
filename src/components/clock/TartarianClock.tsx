"use client";

import { useEffect, useRef } from "react";

interface TartarianClockProps {
  size?: number;
}

const ROMAN = ["XII", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

// Brass palette
const BRASS = "rgba(205, 170, 110, 0.9)";
const BRASS_DIM = "rgba(205, 170, 110, 0.5)";
const BRASS_FAINT = "rgba(205, 170, 110, 0.2)";
const COPPER = "rgba(230, 140, 80, 0.7)";
const GOLD = "rgba(220, 185, 120, 0.95)";
const BG_DARK = "rgba(10, 10, 20, 0.95)";

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
    const r = size / 2 - 4; // Main radius with breathing room

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

      // ── Background ──
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      const bgGrad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, r);
      bgGrad.addColorStop(0, "rgba(18, 18, 30, 0.95)");
      bgGrad.addColorStop(1, BG_DARK);
      ctx!.fillStyle = bgGrad;
      ctx!.fill();
      ctx!.restore();

      // ── Outer brass ring (3px) ──
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r, 0, Math.PI * 2);
      ctx!.strokeStyle = BRASS;
      ctx!.lineWidth = 3;
      ctx!.stroke();
      ctx!.restore();

      // ── Inner ring (1px) ──
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r - 5, 0, Math.PI * 2);
      ctx!.strokeStyle = BRASS_FAINT;
      ctx!.lineWidth = 1;
      ctx!.stroke();
      ctx!.restore();

      // ── Decorative ring between numerals and zodiac ──
      ctx!.save();
      ctx!.beginPath();
      ctx!.arc(cx, cy, r * 0.62, 0, Math.PI * 2);
      ctx!.strokeStyle = BRASS_FAINT;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
      ctx!.restore();

      // ── 60 minute tick marks ──
      for (let i = 0; i < 60; i++) {
        const angle = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const isMajor = i % 15 === 0;
        const outerR = r - 7;
        const innerR = isMajor ? r - 20 : isHour ? r - 16 : r - 12;
        const lw = isMajor ? 2 : isHour ? 1.5 : 0.5;
        const col = isMajor ? BRASS : isHour ? BRASS_DIM : BRASS_FAINT;

        ctx!.save();
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
        ctx!.lineTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
        ctx!.strokeStyle = col;
        ctx!.lineWidth = lw;
        ctx!.stroke();
        ctx!.restore();
      }

      // ── Roman numerals (Cinzel) ──
      ctx!.save();
      ctx!.font = `600 ${r * 0.13}px Cinzel, serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = BRASS;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const numR = r * 0.76;
        const x = cx + Math.cos(angle) * numR;
        const y = cy + Math.sin(angle) * numR;
        ctx!.fillText(ROMAN[i], x, y);
      }
      ctx!.restore();

      // ── Zodiac symbol ring (faint, inner) ──
      ctx!.save();
      ctx!.font = `${r * 0.1}px serif`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillStyle = BRASS_FAINT;
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const zodR = r * 0.52;
        const x = cx + Math.cos(angle) * zodR;
        const y = cy + Math.sin(angle) * zodR;
        ctx!.fillText(ZODIAC[i], x, y);
      }
      ctx!.restore();

      // ── Hour hand: ornate with diamond accent ──
      drawHourHand(ctx!, cx, cy, hourAngle, r);

      // ── Minute hand: slender, brass ──
      drawMinuteHand(ctx!, cx, cy, minAngle, r);

      // ── Second hand: thin copper with counterweight ──
      drawSecondHand(ctx!, cx, cy, secAngle, r);

      // ── Centre pin with radial gradient ──
      ctx!.save();
      const pinGrad = ctx!.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, 6);
      pinGrad.addColorStop(0, GOLD);
      pinGrad.addColorStop(0.6, BRASS);
      pinGrad.addColorStop(1, "rgba(140, 110, 60, 0.9)");
      ctx!.beginPath();
      ctx!.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx!.fillStyle = pinGrad;
      ctx!.fill();
      // Pin highlight
      ctx!.beginPath();
      ctx!.arc(cx - 1, cy - 1, 2, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 240, 200, 0.5)";
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

// ═══════════════════════════════════════════════════════
// Hand drawing functions
// ═══════════════════════════════════════════════════════

function drawHourHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, r: number) {
  const length = r * 0.52;
  const tailLen = r * 0.1;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2); // Rotate so 0 = up

  // Main tapered body
  ctx.beginPath();
  ctx.moveTo(0, -length);         // Tip
  ctx.lineTo(-4.5, -length * 0.3);  // Left shoulder
  ctx.lineTo(-3, 0);                // Left base
  ctx.lineTo(-2, tailLen);          // Left tail
  ctx.lineTo(2, tailLen);           // Right tail
  ctx.lineTo(3, 0);                 // Right base
  ctx.lineTo(4.5, -length * 0.3);   // Right shoulder
  ctx.closePath();

  const handGrad = ctx.createLinearGradient(0, tailLen, 0, -length);
  handGrad.addColorStop(0, "rgba(160, 130, 70, 0.9)");
  handGrad.addColorStop(0.5, GOLD);
  handGrad.addColorStop(1, BRASS);
  ctx.fillStyle = handGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(205, 170, 110, 0.4)";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Diamond accent at midpoint
  const diamondY = -length * 0.55;
  ctx.beginPath();
  ctx.moveTo(0, diamondY - 6);  // Top
  ctx.lineTo(4, diamondY);      // Right
  ctx.lineTo(0, diamondY + 6);  // Bottom
  ctx.lineTo(-4, diamondY);     // Left
  ctx.closePath();
  const dGrad = ctx.createLinearGradient(0, diamondY - 6, 0, diamondY + 6);
  dGrad.addColorStop(0, "rgba(255, 240, 200, 0.6)");
  dGrad.addColorStop(0.5, GOLD);
  dGrad.addColorStop(1, "rgba(180, 150, 80, 0.7)");
  ctx.fillStyle = dGrad;
  ctx.fill();

  ctx.restore();
}

function drawMinuteHand(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number, r: number) {
  const length = r * 0.72;
  const tailLen = r * 0.12;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle + Math.PI / 2);

  ctx.beginPath();
  ctx.moveTo(0, -length);           // Tip (pointed)
  ctx.lineTo(-2.5, -length * 0.15); // Left taper
  ctx.lineTo(-2, 0);
  ctx.lineTo(-1.5, tailLen);
  ctx.lineTo(1.5, tailLen);
  ctx.lineTo(2, 0);
  ctx.lineTo(2.5, -length * 0.15);
  ctx.closePath();

  const mGrad = ctx.createLinearGradient(0, tailLen, 0, -length);
  mGrad.addColorStop(0, "rgba(160, 130, 70, 0.85)");
  mGrad.addColorStop(1, BRASS);
  ctx.fillStyle = mGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(205, 170, 110, 0.3)";
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

  // Main needle
  ctx.beginPath();
  ctx.moveTo(0, -length);
  ctx.lineTo(-0.6, 0);
  ctx.lineTo(0.6, 0);
  ctx.closePath();
  ctx.fillStyle = COPPER;
  ctx.fill();

  // Counterweight (circle)
  ctx.beginPath();
  ctx.arc(0, tailLen * 0.7, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = COPPER;
  ctx.fill();

  // Counterweight tail line
  ctx.beginPath();
  ctx.moveTo(-0.6, 0);
  ctx.lineTo(-1, tailLen);
  ctx.lineTo(1, tailLen);
  ctx.lineTo(0.6, 0);
  ctx.closePath();
  ctx.fillStyle = "rgba(230, 140, 80, 0.5)";
  ctx.fill();

  ctx.restore();
}
