"use client";

import { useEffect, useState } from "react";

interface Props {
  size?: number;
}

/** Large mono digital display — HH : MM : SS with seconds dimmer. */
export function DigitalMonoClock({ size = 220 }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());
  const showColon = now.getSeconds() % 2 === 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontFamily: "var(--font-mono)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 6,
          border: "1px solid var(--border-brass-strong)",
          borderRadius: 12,
          background: "linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.35))",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(0,0,0,0.35)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "baseline",
          gap: Math.max(size * 0.01, 4),
          color: "var(--text-primary)",
          fontSize: size * 0.26,
          fontWeight: 300,
          letterSpacing: -1,
        }}
      >
        <span>{h}</span>
        <span
          style={{
            opacity: showColon ? 0.85 : 0.25,
            transition: "opacity 0.2s ease",
            color: "var(--accent-gold)",
          }}
        >
          :
        </span>
        <span>{m}</span>
        <span
          style={{
            opacity: showColon ? 0.85 : 0.25,
            transition: "opacity 0.2s ease",
            color: "var(--accent-gold)",
          }}
        >
          :
        </span>
        <span style={{ color: "var(--moonsilver)", opacity: 0.55, fontSize: size * 0.2 }}>{s}</span>
      </div>
      <div
        style={{
          position: "relative",
          marginTop: size * 0.04,
          display: "flex",
          gap: size * 0.03,
        }}
      >
        {[...Array(60)].map((_, i) => (
          <span
            key={i}
            style={{
              width: 1,
              height: i % 5 === 0 ? 6 : 3,
              background:
                i <= now.getSeconds() ? "var(--accent-schumann)" : "var(--border-brass-strong)",
              opacity: i <= now.getSeconds() ? 0.9 : 0.3,
              transition: "background 0.3s ease, opacity 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
