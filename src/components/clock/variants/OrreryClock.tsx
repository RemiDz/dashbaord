"use client";

import { useEffect, useRef } from "react";
import { readClockPalette, alpha } from "./clockPalette";

interface Props {
  size?: number;
}

/**
 * Orbital clock — three concentric orbits.
 *   Hour planet (sun disc) orbits every 12 h.
 *   Minute planet (moon) orbits every 60 m.
 *   Second orbit (dust mote) orbits every 60 s.
 * The radial "spoke" to each planet acts as the clock hand.
 */
export function OrreryClock({ size = 220 }: Props) {
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

      // Orbit radii
      const rHour = r * 0.35;
      const rMin = r * 0.62;
      const rSec = r * 0.88;

      // Outer soft halo
      ctx!.save();
      const halo = ctx!.createRadialGradient(cx, cy, r * 0.6, cx, cy, r);
      halo.addColorStop(0, alpha(p.accent, 0));
      halo.addColorStop(1, alpha(p.accent, 0.06));
      ctx!.fillStyle = halo;
      ctx!.fillRect(0, 0, size, size);
      ctx!.restore();

      // Orbital rings
      drawOrbit(ctx!, cx, cy, rSec, alpha(p.secondHand, 0.2));
      drawOrbit(ctx!, cx, cy, rMin, alpha(p.minuteHand, 0.25));
      drawOrbit(ctx!, cx, cy, rHour, alpha(p.hourHand, 0.35));

      // Tick marks on outer (second) orbit — 60
      for (let i = 0; i < 60; i++) {
        const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
        const isHour = i % 5 === 0;
        const tickLen = isHour ? 6 : 2.5;
        ctx!.save();
        ctx!.strokeStyle = isHour ? alpha(p.tickMajor, 0.6) : alpha(p.tickMinor, 0.3);
        ctx!.lineWidth = isHour ? 1.2 : 0.5;
        ctx!.beginPath();
        ctx!.moveTo(cx + Math.cos(a) * rSec, cy + Math.sin(a) * rSec);
        ctx!.lineTo(cx + Math.cos(a) * (rSec + tickLen), cy + Math.sin(a) * (rSec + tickLen));
        ctx!.stroke();
        ctx!.restore();
      }

      // Spokes (clock hands as radial lines)
      drawSpoke(ctx!, cx, cy, hourAngle, rHour, alpha(p.hourHand, 0.45), 1.2);
      drawSpoke(ctx!, cx, cy, minAngle, rMin, alpha(p.minuteHand, 0.35), 1);
      drawSpoke(ctx!, cx, cy, secAngle, rSec, alpha(p.secondHand, 0.25), 0.7);

      // Sun (hour planet) at rHour
      const sunX = cx + Math.cos(hourAngle) * rHour;
      const sunY = cy + Math.sin(hourAngle) * rHour;
      drawPlanet(ctx!, sunX, sunY, 10, p.accent, p.accentSoft, true);

      // Moon (minute planet) at rMin
      const moonX = cx + Math.cos(minAngle) * rMin;
      const moonY = cy + Math.sin(minAngle) * rMin;
      drawPlanet(ctx!, moonX, moonY, 6, p.hourHand, alpha(p.hourHand, 0.3), false);

      // Seed (second) planet
      const secX = cx + Math.cos(secAngle) * rSec;
      const secY = cy + Math.sin(secAngle) * rSec;
      drawPlanet(ctx!, secX, secY, 3.5, p.secondHand, alpha(p.secondHand, 0.4), false);

      // Central star
      ctx!.save();
      const star = ctx!.createRadialGradient(cx - 1, cy - 1, 0, cx, cy, 10);
      star.addColorStop(0, p.textPrimary);
      star.addColorStop(0.5, p.accent);
      star.addColorStop(1, alpha(p.accent, 0));
      ctx!.fillStyle = star;
      ctx!.beginPath();
      ctx!.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.restore();

      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, [size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size }} />;
}

function drawOrbit(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, colour: string) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 0.8;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSpoke(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  angle: number,
  length: number,
  colour: string,
  width: number,
) {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
  ctx.stroke();
  ctx.restore();
}

function drawPlanet(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  colour: string,
  glowColour: string,
  withCorona: boolean,
) {
  ctx.save();
  if (withCorona) {
    const corona = ctx.createRadialGradient(x, y, radius, x, y, radius * 3);
    corona.addColorStop(0, glowColour);
    corona.addColorStop(1, alpha(colour, 0));
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
