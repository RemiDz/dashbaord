"use client";

import { useEffect, useState } from "react";

interface Props {
  size?: number;
}

/** Classic BCD binary clock — six columns of glowing bits. */
export function BinaryLedClock({ size = 220 }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 500);
    return () => clearInterval(id);
  }, []);

  const h = pad(now.getHours());
  const m = pad(now.getMinutes());
  const s = pad(now.getSeconds());

  const columns: { digit: number; bits: number }[] = [
    { digit: Number(h[0]), bits: 2 },
    { digit: Number(h[1]), bits: 4 },
    { digit: Number(m[0]), bits: 3 },
    { digit: Number(m[1]), bits: 4 },
    { digit: Number(s[0]), bits: 3 },
    { digit: Number(s[1]), bits: 4 },
  ];

  const maxRows = 4;
  const cellGap = size * 0.04;
  const cols = columns.length;
  const cellSize = Math.min(size * 0.11, (size - cellGap * (cols + 1)) / cols);

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
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: cellGap,
          padding: cellGap,
          background: "rgba(8,8,20,0.4)",
          border: "1px solid var(--border-brass)",
          borderRadius: 10,
        }}
      >
        {columns.map((col, ci) => (
          <div
            key={ci}
            style={{
              display: "flex",
              flexDirection: "column-reverse",
              gap: cellGap,
              justifyContent: "flex-start",
            }}
          >
            {[...Array(maxRows)].map((_, row) => {
              const bitValue = 1 << row;
              const active = row < col.bits && (col.digit & bitValue) !== 0;
              return (
                <div
                  key={row}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    borderRadius: "50%",
                    background: active ? "var(--accent-schumann)" : "rgba(60, 70, 100, 0.1)",
                    boxShadow: active
                      ? "0 0 8px var(--accent-schumann), inset 0 0 6px rgba(255,255,255,0.35)"
                      : "inset 0 0 0 1px rgba(120,130,160,0.15)",
                    visibility: row >= col.bits ? "hidden" : "visible",
                    transition: "background 0.3s ease, box-shadow 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: size * 0.08,
          color: "var(--moonsilver)",
          opacity: 0.45,
          letterSpacing: 3,
        }}
      >
        {h}:{m}:{s}
      </div>
    </div>
  );
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
