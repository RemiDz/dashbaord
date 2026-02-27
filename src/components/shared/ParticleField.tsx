"use client";

import { useEffect, useRef } from "react";

interface ParticleFieldProps {
  /** KP index value — drives particle count, speed and tint */
  kp?: number | null;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
}

function createParticle(w: number, h: number, speedMul: number): Particle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.3 * speedMul,
    vy: (Math.random() - 0.5) * 0.3 * speedMul,
    radius: Math.random() * 1.5 + 0.5,
    alpha: Math.random() * 0.3 + 0.05,
  };
}

export function ParticleField({ kp }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const kpRef = useRef(kp ?? 0);

  // Keep kpRef current without re-creating the animation loop
  useEffect(() => {
    kpRef.current = kp ?? 0;
  }, [kp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    let currentCount = 0;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 1000 / 60; // Cap at 60fps

    function getTargets() {
      const k = kpRef.current;
      const count = k >= 5 ? 120 : k >= 3 ? 80 : 40;
      const speed = k >= 5 ? 1.6 : k >= 3 ? 1.25 : 1;
      return { count, speed };
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = `${window.innerWidth}px`;
      canvas!.style.height = `${window.innerHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      const { count, speed } = getTargets();
      currentCount = count;
      particles = Array.from({ length: count }, () =>
        createParticle(window.innerWidth, window.innerHeight, speed)
      );
    }

    function draw(timestamp?: number) {
      // Cap at 60fps — skip frame if called too soon
      if (timestamp !== undefined) {
        if (timestamp - lastFrameTime < FRAME_INTERVAL) {
          animId = requestAnimationFrame(draw);
          return;
        }
        lastFrameTime = timestamp;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      const k = kpRef.current;
      const { count: target, speed } = getTargets();

      // Gradually add/remove particles to match KP-driven target
      if (particles.length < target) {
        particles.push(createParticle(w, h, speed));
      } else if (particles.length > target && particles.length > 0) {
        particles.pop();
      }

      // Warm tint during storms (KP ≥ 5)
      const r = k >= 5 ? 230 : 205;
      const g = k >= 5 ? 140 : 170;
      const b = k >= 5 ? 80 : 110;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha})`;
        ctx!.fill();
      }

      animId = requestAnimationFrame(draw);
    }

    init();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []); // Single loop — reads kpRef for live reactivity

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, willChange: "transform" }}
    />
  );
}
