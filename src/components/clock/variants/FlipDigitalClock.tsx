"use client";

import { useEffect, useState } from "react";

interface Props {
  size?: number;
}

/** Split-flap style digital clock (CSS only, no real physics). */
export function FlipDigitalClock({ size = 220 }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const cellW = size * 0.2;
  const cellH = size * 0.32;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: size * 0.03,
      }}
    >
      <div style={{ display: "flex", gap: size * 0.03, alignItems: "center" }}>
        <FlipCell value={h[0]} width={cellW} height={cellH} />
        <FlipCell value={h[1]} width={cellW} height={cellH} />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: cellH * 0.6,
            color: "var(--accent-gold)",
            opacity: now.getSeconds() % 2 === 0 ? 0.9 : 0.3,
            transition: "opacity 0.2s ease",
          }}
        >
          :
        </span>
        <FlipCell value={m[0]} width={cellW} height={cellH} />
        <FlipCell value={m[1]} width={cellW} height={cellH} />
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          fontFamily: "var(--font-display)",
          fontSize: size * 0.06,
          letterSpacing: 3,
          textTransform: "uppercase",
          color: "var(--moonsilver)",
          opacity: 0.45,
        }}
      >
        <span>{format(now, { weekday: "short" })}</span>
        <span>·</span>
        <span>{format(now, { day: "numeric", month: "short" })}</span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: size * 0.07,
          color: "var(--accent-schumann)",
          opacity: 0.55,
        }}
      >
        :{pad(now.getSeconds())}
      </div>
    </div>
  );
}

function FlipCell({ value, width, height }: { value: string; width: number; height: number }) {
  return (
    <div
      style={{
        width,
        height,
        position: "relative",
        background: "linear-gradient(180deg, rgba(20,20,35,0.95) 0%, rgba(10,10,20,0.95) 49%, rgba(8,8,18,0.95) 51%, rgba(4,4,12,0.95) 100%)",
        border: "1px solid var(--border-brass-strong)",
        borderRadius: 8,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.35)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Hinge line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "50%",
          height: 1,
          background: "rgba(0,0,0,0.6)",
          boxShadow: "0 1px 0 rgba(255,255,255,0.06)",
        }}
      />
      <span
        key={value}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: height * 0.75,
          fontWeight: 300,
          color: "var(--text-primary)",
          textShadow: "0 2px 6px rgba(0,0,0,0.6)",
          animation: "flipIn 0.5s ease",
          display: "inline-block",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function format(d: Date, opts: Intl.DateTimeFormatOptions) {
  return d.toLocaleDateString("en-GB", opts);
}
