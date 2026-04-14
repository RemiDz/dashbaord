export interface ClockPalette {
  ring: string;
  ringFaint: string;
  tickMajor: string;
  tickMinor: string;
  numeral: string;
  hourHand: string;
  minuteHand: string;
  secondHand: string;
  centreDot: string;
  bgInner: string;
  bgOuter: string;
  accent: string;
  accentSoft: string;
  textPrimary: string;
  textSecondary: string;
  moonsilver: string;
}

/** Read the currently active theme tokens from CSS custom properties. */
export function readClockPalette(): ClockPalette {
  if (typeof document === "undefined") {
    return fallbackPalette();
  }
  const style = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;

  const silver = get("--moonsilver", "#C8C4DC");
  const selenite = get("--selenite-white", "#F0EEF8");
  const gold = get("--accent-gold", "#E8C97A");
  const schumann = get("--accent-schumann", "rgba(120, 180, 255, 0.9)");
  const voidBlack = get("--void-black", "#05050F");

  return {
    ring: alpha(silver, 0.85),
    ringFaint: alpha(silver, 0.15),
    tickMajor: alpha(silver, 0.9),
    tickMinor: alpha(silver, 0.35),
    numeral: alpha(selenite, 0.85),
    hourHand: selenite,
    minuteHand: silver,
    secondHand: schumann,
    centreDot: selenite,
    bgInner: alpha(voidBlack, 0.95),
    bgOuter: alpha(voidBlack, 0.75),
    accent: gold,
    accentSoft: alpha(gold, 0.4),
    textPrimary: selenite,
    textSecondary: alpha(silver, 0.6),
    moonsilver: silver,
  };
}

/**
 * Normalise a CSS colour to an `rgba(..., a)` string so the canvas can
 * mix per-element alphas without guessing the source format. Handles
 * #rgb, #rrggbb, and existing rgb/rgba strings.
 */
export function alpha(colour: string, a: number): string {
  const c = colour.trim();
  if (c.startsWith("#")) {
    const hex = c.slice(1);
    const expand = hex.length === 3 ? hex.split("").map((h) => h + h).join("") : hex.padEnd(6, "0").slice(0, 6);
    const r = parseInt(expand.slice(0, 2), 16);
    const g = parseInt(expand.slice(2, 4), 16);
    const b = parseInt(expand.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const rgbaMatch = c.match(/^rgba?\(([^)]+)\)/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(",").map((p) => p.trim());
    const [r, g, b] = parts;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  return c;
}

function fallbackPalette(): ClockPalette {
  return {
    ring: "rgba(200, 196, 220, 0.85)",
    ringFaint: "rgba(200, 196, 220, 0.15)",
    tickMajor: "rgba(200, 196, 220, 0.9)",
    tickMinor: "rgba(200, 196, 220, 0.35)",
    numeral: "rgba(240, 238, 248, 0.85)",
    hourHand: "#F0EEF8",
    minuteHand: "#C8C4DC",
    secondHand: "rgba(120, 180, 255, 0.9)",
    centreDot: "#F0EEF8",
    bgInner: "rgba(12, 12, 24, 0.95)",
    bgOuter: "rgba(5, 5, 15, 0.75)",
    accent: "#E8C97A",
    accentSoft: "rgba(232, 201, 122, 0.4)",
    textPrimary: "#F0EEF8",
    textSecondary: "rgba(200, 196, 220, 0.6)",
    moonsilver: "#C8C4DC",
  };
}
