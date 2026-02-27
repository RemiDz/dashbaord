"use client";

interface MoonPhaseProps {
  /** 0–1, fraction of disc illuminated */
  illumination: number;
  /** 0–1 where 0 = new moon, 0.5 = full moon, 1 = next new moon */
  phase: number;
  /** Diameter in px */
  size?: number;
}

export function MoonPhase({ illumination, phase, size = 80 }: MoonPhaseProps) {
  const r = size / 2;
  const cx = r;
  const cy = r;
  const moonR = r * 0.82;

  // Compute the terminator curve.
  // phase 0→0.5 = waxing (right side lit), 0.5→1 = waning (left side lit).
  // The terminator is an ellipse whose x-radius sweeps from moonR → 0 → -moonR.
  //
  // We draw two arcs to form the lit area:
  //   1. The outer limb (always a semicircle on the lit side)
  //   2. The terminator (an elliptical curve across the disc)
  //
  // cos(phase * 2π) gives us the "squeeze" factor for the terminator ellipse.
  const sweep = Math.cos(phase * 2 * Math.PI);

  // The terminator x-radius (negative means it bows the other way)
  const tx = moonR * sweep;

  // Whether the right side is lit (waxing: phase 0→0.5)
  const rightLit = phase <= 0.5;

  // Build the lit-area path.
  // We always trace from top → bottom of the disc.
  //
  // Outer limb arc (semicircle on the lit side):
  //   If rightLit: arc from top to bottom going right (sweep-flag 1)
  //   If leftLit:  arc from top to bottom going left  (sweep-flag 0)
  //
  // Terminator arc (elliptical):
  //   From bottom back to top. rx = |tx|, ry = moonR.
  //   The sweep direction depends on which side is lit and the sign of tx.

  const top = `${cx} ${cy - moonR}`;
  const bot = `${cx} ${cy + moonR}`;

  // Outer limb: semicircle
  const limbSweep = rightLit ? 1 : 0;
  const limbArc = `A ${moonR} ${moonR} 0 0 ${limbSweep} ${bot}`;

  // Terminator: elliptical arc from bottom back to top
  // rx = Math.abs(tx), ry = moonR
  // sweep depends on whether the terminator bows toward or away from the lit side
  const absTx = Math.abs(tx);
  let termSweep: number;
  if (rightLit) {
    termSweep = tx >= 0 ? 0 : 1;
  } else {
    termSweep = tx >= 0 ? 1 : 0;
  }
  const termArc = `A ${absTx} ${moonR} 0 0 ${termSweep} ${top}`;

  const litPath = `M ${top} ${limbArc} ${termArc} Z`;

  // Glow filter ID — unique per instance in case multiple moons render
  const glowId = `moonGlow-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-label={`Moon phase: ${Math.round(illumination * 100)}% illuminated`}
    >
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(230, 220, 180, 0.08)" />
          <stop offset="100%" stopColor="rgba(230, 220, 180, 0)" />
        </radialGradient>
      </defs>

      {/* Subtle radial glow behind moon */}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${glowId})`} />

      {/* Dark disc (unlit portion) */}
      <circle
        cx={cx}
        cy={cy}
        r={moonR}
        fill="rgba(20, 20, 30, 0.9)"
        stroke="rgba(205, 170, 110, 0.15)"
        strokeWidth={0.5}
      />

      {/* Lit portion — warm white */}
      <path
        d={litPath}
        fill="rgba(230, 220, 180, 0.85)"
      />
    </svg>
  );
}
