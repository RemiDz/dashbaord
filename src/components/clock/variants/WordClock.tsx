"use client";

import { useEffect, useState } from "react";

interface Props {
  size?: number;
}

const HOURS = [
  "twelve", "one", "two", "three", "four", "five",
  "six", "seven", "eight", "nine", "ten", "eleven",
];

const PHRASES: Record<number, string> = {
  0: "",
  5: "five past",
  10: "ten past",
  15: "quarter past",
  20: "twenty past",
  25: "twenty-five past",
  30: "half past",
  35: "twenty-five to",
  40: "twenty to",
  45: "quarter to",
  50: "ten to",
  55: "five to",
};

export function WordClock({ size = 220 }: Props) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 5_000);
    return () => clearInterval(id);
  }, []);

  const h = now.getHours();
  const m = now.getMinutes();
  const phraseMinutes = Math.round(m / 5) * 5;

  let hourIndex = h % 12;
  if (phraseMinutes > 30) hourIndex = (hourIndex + 1) % 12;

  const phrase = PHRASES[phraseMinutes] ?? "";
  const hourWord = HOURS[hourIndex];
  const hourIsOClock = phraseMinutes === 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: size * 0.05,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: size * 0.06,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: "var(--text-label)",
          marginBottom: size * 0.04,
        }}
      >
        It is
      </div>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 400,
          fontStyle: "italic",
          fontSize: size * (phrase ? 0.14 : 0.19),
          lineHeight: 1.1,
          color: "var(--text-primary)",
        }}
      >
        {phrase ? (
          <>
            <span style={{ color: "var(--accent-schumann)" }}>{phrase}</span>
            <br />
            <span style={{ color: "var(--accent-gold)" }}>{hourWord}</span>
          </>
        ) : (
          <>
            <span style={{ color: "var(--accent-gold)" }}>{hourWord}</span>
            <br />
            <span style={{ color: "var(--text-secondary)" }}>o&apos;clock</span>
          </>
        )}
      </div>
      {!hourIsOClock && (
        <div
          style={{
            marginTop: size * 0.04,
            fontFamily: "var(--font-mono)",
            fontSize: size * 0.055,
            color: "var(--text-dim)",
            letterSpacing: 1,
          }}
        >
          ~{pad(h)}:{pad(m)}
        </div>
      )}
    </div>
  );
}

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}
