"use client";

import { useEffect, useRef } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  showArea?: boolean;
  threshold?: number;
  thresholdColor?: string;
  /** When true, the endpoint dot pulses with an animated glow */
  pulseEndpoint?: boolean;
  /** Number of faint horizontal reference lines to draw */
  referenceLines?: number;
}

export function Sparkline({
  data,
  color = "rgba(120, 180, 255, 0.9)",
  height = 100,
  showArea = true,
  threshold,
  thresholdColor = "rgba(120, 180, 255, 0.25)",
  pulseEndpoint = false,
  referenceLines = 3,
}: SparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef(pulseEndpoint);
  pulseRef.current = pulseEndpoint;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || data.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const rect = container!.getBoundingClientRect();
      const w = rect.width;
      const h = height;

      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pad = { top: 8, bottom: 8, left: 0, right: 0 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      function toX(i: number) {
        return pad.left + (i / (data.length - 1)) * plotW;
      }
      function toY(val: number) {
        return pad.top + plotH - ((val - min) / range) * plotH;
      }

      ctx!.clearRect(0, 0, w, h);

      // --- Faint horizontal reference lines ---
      if (referenceLines > 0) {
        ctx!.save();
        ctx!.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx!.lineWidth = 0.5;
        for (let i = 0; i <= referenceLines; i++) {
          const val = min + (range * i) / referenceLines;
          const y = toY(val);
          ctx!.beginPath();
          ctx!.moveTo(pad.left, y);
          ctx!.lineTo(w - pad.right, y);
          ctx!.stroke();
        }
        ctx!.restore();
      }

      // --- Threshold line ---
      if (threshold !== undefined) {
        const ty = toY(threshold);
        if (ty >= pad.top && ty <= h - pad.bottom) {
          ctx!.save();
          ctx!.setLineDash([4, 4]);
          ctx!.strokeStyle = thresholdColor;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(pad.left, ty);
          ctx!.lineTo(w - pad.right, ty);
          ctx!.stroke();
          ctx!.restore();
        }
      }

      // --- Build smooth path using cardinal spline ---
      const points: [number, number][] = data.map((v, i) => [toX(i), toY(v)]);

      function cardinalSpline(pts: [number, number][], tension: number) {
        const path = new Path2D();
        if (pts.length < 2) return path;

        path.moveTo(pts[0][0], pts[0][1]);

        if (pts.length === 2) {
          path.lineTo(pts[1][0], pts[1][1]);
          return path;
        }

        for (let i = 0; i < pts.length - 1; i++) {
          const p0 = pts[i === 0 ? 0 : i - 1];
          const p1 = pts[i];
          const p2 = pts[i + 1];
          const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];

          const cp1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension;
          const cp1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension;
          const cp2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension;
          const cp2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension;

          path.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
        }

        return path;
      }

      const linePath = cardinalSpline(points, 1);

      // --- Area fill (richer gradient) ---
      if (showArea) {
        const areaPath = new Path2D();
        areaPath.addPath(linePath);
        areaPath.lineTo(points[points.length - 1][0], h);
        areaPath.lineTo(points[0][0], h);
        areaPath.closePath();

        const gradient = ctx!.createLinearGradient(0, pad.top, 0, h);
        gradient.addColorStop(0, color.replace(/[\d.]+\)$/, "0.35)"));
        gradient.addColorStop(0.4, color.replace(/[\d.]+\)$/, "0.12)"));
        gradient.addColorStop(1, color.replace(/[\d.]+\)$/, "0.0)"));
        ctx!.fillStyle = gradient;
        ctx!.fill(areaPath);
      }

      // --- Line stroke (thicker: 3px) ---
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 3;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx!.stroke(linePath);

      // --- Subtle inner line highlight (gives line more depth) ---
      ctx!.save();
      ctx!.strokeStyle = color.replace(/[\d.]+\)$/, "0.3)");
      ctx!.lineWidth = 5;
      ctx!.filter = "blur(3px)";
      ctx!.stroke(linePath);
      ctx!.restore();

      // --- Glowing endpoint dot (larger) ---
      const lastPt = points[points.length - 1];

      // Animated pulse
      const pulse = pulseRef.current
        ? 0.5 + 0.5 * Math.sin(Date.now() / 400)
        : 0;
      const glowRadius = 4 + pulse * 3;
      const glowBlur = 12 + pulse * 14;

      // Outer glow
      ctx!.save();
      ctx!.shadowColor = color;
      ctx!.shadowBlur = glowBlur;
      ctx!.beginPath();
      ctx!.arc(lastPt[0], lastPt[1], glowRadius, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();
      ctx!.restore();

      // Mid ring
      ctx!.beginPath();
      ctx!.arc(lastPt[0], lastPt[1], 3, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();

      // Inner bright core
      ctx!.beginPath();
      ctx!.arc(lastPt[0], lastPt[1], 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx!.fill();
    }

    draw();

    // When pulsing, run a lightweight animation loop for the endpoint
    let pulseAnimId: number | null = null;
    function pulseLoop() {
      if (pulseRef.current) {
        draw();
        pulseAnimId = requestAnimationFrame(pulseLoop);
      }
    }
    if (pulseEndpoint) pulseLoop();

    const observer = new ResizeObserver(() => {
      draw();
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (pulseAnimId !== null) cancelAnimationFrame(pulseAnimId);
    };
  }, [data, color, height, showArea, threshold, thresholdColor, pulseEndpoint, referenceLines]);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
