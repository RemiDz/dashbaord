export interface BinaraRecommendation {
  frequency: number;
  band: string;
  description: string;
  color: string;
}

interface BinaraContext {
  kp?: number | null;
  schumannDeviation?: number;
}

const schedule: { start: number; end: number; rec: BinaraRecommendation }[] = [
  { start: 0, end: 6, rec: { frequency: 2, band: "Delta", description: "Deep restorative sleep", color: "rgba(120, 140, 200, 0.9)" } },
  { start: 6, end: 10, rec: { frequency: 10, band: "Alpha", description: "Morning awakening flow", color: "rgba(220, 185, 120, 0.9)" } },
  { start: 10, end: 14, rec: { frequency: 14, band: "Beta", description: "Focused clarity", color: "rgba(200, 160, 100, 0.9)" } },
  { start: 14, end: 18, rec: { frequency: 7.83, band: "Theta", description: "Earth resonance alignment", color: "rgba(100, 200, 160, 0.9)" } },
  { start: 18, end: 21, rec: { frequency: 6, band: "Theta", description: "Evening wind-down", color: "rgba(160, 140, 200, 0.9)" } },
  { start: 21, end: 24, rec: { frequency: 3, band: "Delta", description: "Transition to sleep", color: "rgba(120, 140, 200, 0.9)" } },
];

/**
 * Returns a frequency recommendation based on time of day,
 * optionally adjusted by live geomagnetic and Schumann conditions.
 */
export function getBinaraRecommendation(
  hour: number,
  ctx: BinaraContext = {}
): BinaraRecommendation {
  const base = schedule.find((s) => hour >= s.start && hour < s.end)?.rec ?? schedule[0].rec;

  // If Schumann is spiking (> 1.5 Hz deviation), recommend grounding at Earth resonance
  if (ctx.schumannDeviation !== undefined && ctx.schumannDeviation > 1.5) {
    return {
      frequency: 7.83,
      band: "Theta",
      description: "Schumann spike — ground with Earth resonance",
      color: "rgba(205, 170, 110, 0.9)",
    };
  }

  // If geomagnetic storm (Kp ≥ 5), recommend calming Delta
  if (ctx.kp !== undefined && ctx.kp !== null && ctx.kp >= 5) {
    return {
      frequency: 4,
      band: "Theta",
      description: "Geomagnetic storm — calming low-frequency session",
      color: "rgba(230, 90, 60, 0.9)",
    };
  }

  // If elevated Kp (≥ 3), adjust description to note conditions
  if (ctx.kp !== undefined && ctx.kp !== null && ctx.kp >= 3) {
    return {
      ...base,
      description: `${base.description} · elevated Kp`,
    };
  }

  return base;
}
