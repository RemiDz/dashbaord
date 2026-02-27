"use client";

import { useEffect, useRef } from "react";

/**
 * Deep-space star field background.
 *
 * ~200 fixed tiny stars at varying opacity. A handful of "bright" stars
 * twinkle via a lightweight rAF loop. Stars are static (no movement) —
 * this is a calm cosmic backdrop, not a screensaver.
 */

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkle: boolean;
  /** Phase offset for twinkle animation (0–2π) */
  phase: number;
  /** Twinkle speed multiplier */
  speed: number;
}

const STAR_COUNT = 200;
const BRIGHT_STAR_COUNT = 15;

function createStars(w: number, h: number): Star[] {
  const stars: Star[] = [];

  for (let i = 0; i < STAR_COUNT; i++) {
    const isBright = i < BRIGHT_STAR_COUNT;
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      radius: isBright
        ? Math.random() * 1.2 + 0.8
        : Math.random() * 0.8 + 0.3,
      baseAlpha: isBright
        ? Math.random() * 0.3 + 0.5
        : Math.random() * 0.35 + 0.08,
      twinkle: isBright,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.7,
    });
  }

  return stars;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let stars: Star[] = [];
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 30; // 30fps is plenty for twinkling

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = createStars(w, h);
    }

    function draw(timestamp: number) {
      if (timestamp - lastFrameTime < FRAME_INTERVAL) {
        animId = requestAnimationFrame(draw);
        return;
      }
      lastFrameTime = timestamp;

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      const time = timestamp / 1000;

      for (const star of stars) {
        let alpha = star.baseAlpha;

        if (star.twinkle) {
          // Smooth oscillation between dim and bright
          const t = Math.sin(time * star.speed + star.phase);
          alpha = star.baseAlpha * (0.4 + 0.6 * ((t + 1) / 2));
        }

        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(200, 210, 240, ${alpha})`;
        ctx!.fill();

        // Bright stars get a subtle glow
        if (star.twinkle && alpha > 0.5) {
          ctx!.beginPath();
          ctx!.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
          const grad = ctx!.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, star.radius * 3
          );
          grad.addColorStop(0, `rgba(180, 200, 255, ${alpha * 0.15})`);
          grad.addColorStop(1, "transparent");
          ctx!.fillStyle = grad;
          ctx!.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    resize();
    animId = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, willChange: "transform" }}
      aria-hidden="true"
    />
  );
}
