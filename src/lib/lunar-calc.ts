/**
 * Client-side lunar calculations.
 *
 * Algorithms based on Jean Meeus, "Astronomical Algorithms" (2nd ed.).
 * Accuracy: phase ±0.5 day, ecliptic longitude ±2°, illumination ±2%.
 * Sufficient for a dashboard display — not for navigation.
 */

// ── Types ──────────────────────────────────────────────────

export interface LunarData {
  /** 0–1 where 0 = new moon, 0.5 = full moon, 1 = next new moon */
  phase: number;
  /** 0–1, fraction of disc illuminated */
  illumination: number;
  /** Human-readable phase name */
  phaseName: string;
  /** Zodiac sign name */
  sign: string;
  /** Zodiac sign symbol */
  signSymbol: string;
  /** Associated classical element */
  element: string;
  /** Element emoji */
  elementSymbol: string;
  /** Next full moon date formatted */
  nextFull: string;
  /** Next new moon date formatted */
  nextNew: string;
  /** Void of Course time (estimated) */
  voidOfCourse: string;
  /** Moon's ecliptic longitude in degrees */
  eclipticLongitude: number;
}

// ── Constants ──────────────────────────────────────────────

const SYNODIC_MONTH = 29.53058868; // days
const KNOWN_NEW_MOON = 2451550.1; // JDE of a known new moon (2000 Jan 6 18:14 UTC)

const ZODIAC = [
  { name: "Aries", symbol: "\u2648", element: "Fire", elementSymbol: "\uD83D\uDD25" },
  { name: "Taurus", symbol: "\u2649", element: "Earth", elementSymbol: "\uD83C\uDF0D" },
  { name: "Gemini", symbol: "\u264A", element: "Air", elementSymbol: "\uD83D\uDCA8" },
  { name: "Cancer", symbol: "\u264B", element: "Water", elementSymbol: "\uD83D\uDCA7" },
  { name: "Leo", symbol: "\u264C", element: "Fire", elementSymbol: "\uD83D\uDD25" },
  { name: "Virgo", symbol: "\u264D", element: "Earth", elementSymbol: "\uD83C\uDF0D" },
  { name: "Libra", symbol: "\u264E", element: "Air", elementSymbol: "\uD83D\uDCA8" },
  { name: "Scorpio", symbol: "\u264F", element: "Water", elementSymbol: "\uD83D\uDCA7" },
  { name: "Sagittarius", symbol: "\u2650", element: "Fire", elementSymbol: "\uD83D\uDD25" },
  { name: "Capricorn", symbol: "\u2651", element: "Earth", elementSymbol: "\uD83C\uDF0D" },
  { name: "Aquarius", symbol: "\u2652", element: "Air", elementSymbol: "\uD83D\uDCA8" },
  { name: "Pisces", symbol: "\u2653", element: "Water", elementSymbol: "\uD83D\uDCA7" },
];

// ── Julian Date ────────────────────────────────────────────

export function toJulianDate(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d =
    date.getUTCDate() +
    date.getUTCHours() / 24 +
    date.getUTCMinutes() / 1440 +
    date.getUTCSeconds() / 86400;

  let yr = y;
  let mo = m;
  if (mo <= 2) {
    yr -= 1;
    mo += 12;
  }

  const A = Math.floor(yr / 100);
  const B = 2 - A + Math.floor(A / 4);

  return (
    Math.floor(365.25 * (yr + 4716)) +
    Math.floor(30.6001 * (mo + 1)) +
    d +
    B -
    1524.5
  );
}

function fromJulianDate(jd: number): Date {
  const z = Math.floor(jd + 0.5);
  const f = jd + 0.5 - z;
  let A = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    A = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E) + f;
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  const d = Math.floor(day);
  const h = (day - d) * 24;
  return new Date(Date.UTC(year, month - 1, d, Math.floor(h), Math.round((h % 1) * 60)));
}

// ── Moon Phase ─────────────────────────────────────────────

/**
 * Returns the moon's phase as a fraction 0–1 (0 = new, 0.5 = full).
 */
export function getMoonPhase(jd: number): number {
  const daysSinceNew = jd - KNOWN_NEW_MOON;
  const cycles = daysSinceNew / SYNODIC_MONTH;
  return cycles - Math.floor(cycles);
}

/**
 * Returns illumination fraction 0–1.
 * Uses the simple cosine approximation from the phase angle.
 */
function getIllumination(phase: number): number {
  return (1 - Math.cos(phase * 2 * Math.PI)) / 2;
}

export function getPhaseName(phase: number): string {
  if (phase < 0.025 || phase >= 0.975) return "New Moon";
  if (phase < 0.225) return "Waxing Crescent";
  if (phase < 0.275) return "First Quarter";
  if (phase < 0.475) return "Waxing Gibbous";
  if (phase < 0.525) return "Full Moon";
  if (phase < 0.725) return "Waning Gibbous";
  if (phase < 0.775) return "Last Quarter";
  return "Waning Crescent";
}

// ── Moon Ecliptic Longitude (simplified) ───────────────────

/**
 * Low-precision moon ecliptic longitude.
 * Based on Meeus ch. 47 simplified — accurate to ~2°.
 */
function getMoonLongitude(jd: number): number {
  // Centuries since J2000.0
  const T = (jd - 2451545.0) / 36525.0;

  // Mean longitude (deg)
  const Lp = 218.3165 + 481267.8813 * T;

  // Mean elongation (deg)
  const D = 297.8502 + 445267.1115 * T;

  // Sun's mean anomaly (deg)
  const M = 357.5291 + 35999.0503 * T;

  // Moon's mean anomaly (deg)
  const Mp = 134.9634 + 477198.8676 * T;

  // Moon's argument of latitude (deg)
  const F = 93.272 + 483202.0175 * T;

  const toRad = Math.PI / 180;

  // Principal perturbation terms
  let lon = Lp;
  lon += 6.289 * Math.sin(Mp * toRad);
  lon += 1.274 * Math.sin((2 * D - Mp) * toRad);
  lon += 0.658 * Math.sin(2 * D * toRad);
  lon += 0.214 * Math.sin(2 * Mp * toRad);
  lon -= 0.186 * Math.sin(M * toRad);
  lon -= 0.114 * Math.sin(2 * F * toRad);

  return ((lon % 360) + 360) % 360;
}

function getZodiacSign(longitude: number) {
  const index = Math.floor(longitude / 30) % 12;
  return ZODIAC[index];
}

// ── Next Full / New Moon ───────────────────────────────────

function findNextPhase(jd: number, targetPhase: number): Date {
  // targetPhase: 0 = new, 0.5 = full
  const currentPhase = getMoonPhase(jd);
  let daysAhead = (targetPhase - currentPhase) * SYNODIC_MONTH;
  if (daysAhead <= 0) daysAhead += SYNODIC_MONTH;
  return fromJulianDate(jd + daysAhead);
}

function formatDateBritish(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Void of Course (simplified estimate) ───────────────────

/**
 * Estimates the next void-of-course window.
 * True VoC requires full aspect calculations; we approximate
 * by estimating when the Moon is about to leave its current sign.
 * The Moon moves ~13.2°/day, spending ~2.3 days per sign.
 */
function getVoidOfCourse(jd: number, longitude: number): string {
  const signStart = Math.floor(longitude / 30) * 30;
  const signEnd = signStart + 30;
  const degreesLeft = signEnd - longitude;
  const hoursToTransit = (degreesLeft / 13.2) * 24;

  // VoC typically begins some hours before the sign change
  const vocStartHours = Math.max(0, hoursToTransit - 3);

  const vocTime = new Date(fromJulianDate(jd).getTime() + vocStartHours * 3600000);

  return vocTime.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

// ── Public API ─────────────────────────────────────────────

export function calculateLunarData(date: Date = new Date()): LunarData {
  const jd = toJulianDate(date);
  const phase = getMoonPhase(jd);
  const illumination = getIllumination(phase);
  const longitude = getMoonLongitude(jd);
  const zodiac = getZodiacSign(longitude);

  const nextFullDate = findNextPhase(jd, 0.5);
  const nextNewDate = findNextPhase(jd, 0);

  return {
    phase,
    illumination,
    phaseName: getPhaseName(phase),
    sign: zodiac.name,
    signSymbol: zodiac.symbol,
    element: zodiac.element,
    elementSymbol: zodiac.elementSymbol,
    nextFull: formatDateBritish(nextFullDate),
    nextNew: formatDateBritish(nextNewDate),
    voidOfCourse: getVoidOfCourse(jd, longitude),
    eclipticLongitude: parseFloat(longitude.toFixed(1)),
  };
}
