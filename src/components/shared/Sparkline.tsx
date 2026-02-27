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
}

export function Sparkline({
  data,
  color = "rgba(205, 170, 110, 0.9)",
  height = 60,
  showArea = true,
  threshold,
  thresholdColor = "rgba(205, 170, 110, 0.25)",
  pulseEndpoint = false,
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

      const pad = { top: 4, bottom: 4, left: 0, right: 0 };
      const plotW = w - pad.left - pad.right;
      const plotH = h - pad.top - pad.bottom;

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      // Map data to canvas coordinates
      function toX(i: number) {
        return pad.left + (i / (data.length - 1)) * plotW;
      }
      function toY(val: number) {
        return pad.top + plotH - ((val - min) / range) * plotH;
      }

      ctx!.clearRect(0, 0, w, h);

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

      // --- Area fill ---
      if (showArea) {
        const areaPath = new Path2D();
        areaPath.addPath(linePath);
        // Close the area to the bottom
        areaPath.lineTo(points[points.length - 1][0], h);
        areaPath.lineTo(points[0][0], h);
        areaPath.closePath();

        const gradient = ctx!.createLinearGradient(0, pad.top, 0, h);
        // Parse base colour for gradient — extract rgb values
        gradient.addColorStop(0, color.replace(/[\d.]+\)$/, "0.25)"));
        gradient.addColorStop(1, color.replace(/[\d.]+\)$/, "0.0)"));
        ctx!.fillStyle = gradient;
        ctx!.fill(areaPath);
      }

      // --- Line stroke ---
      ctx!.strokeStyle = color;
      ctx!.lineWidth = 1.5;
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";
      ctx!.stroke(linePath);

      // --- Glowing endpoint dot ---
      const lastPt = points[points.length - 1];

      // Animated pulse: modulate glow radius and blur over time
      const pulse = pulseRef.current
        ? 0.5 + 0.5 * Math.sin(Date.now() / 400)
        : 0;
      const glowRadius = 3 + pulse * 2;
      const glowBlur = 8 + pulse * 10;

      // Outer glow
      ctx!.save();
      ctx!.shadowColor = color;
      ctx!.shadowBlur = glowBlur;
      ctx!.beginPath();
      ctx!.arc(lastPt[0], lastPt[1], glowRadius, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();
      ctx!.restore();

      // Inner bright core
      ctx!.beginPath();
      ctx!.arc(lastPt[0], lastPt[1], 1.5, 0, Math.PI * 2);
      ctx!.fillStyle = "#fff";
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
  }, [data, color, height, showArea, threshold, thresholdColor, pulseEndpoint]);

  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
