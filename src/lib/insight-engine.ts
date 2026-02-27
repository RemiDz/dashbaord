/**
 * Insight Engine — generates contextual practitioner guidance
 * from combined live Earth/cosmic conditions.
 *
 * Priority order:
 *   1. Schumann spike (highest priority — rare event)
 *   2. Geomagnetic storm (Kp ≥ 5)
 *   3. Full moon
 *   4. New moon
 *   5. Storm + Fire/Earth element
 *   6. Elevated Kp + element combos
 *   7. Rising tide + morning
 *   8. Falling tide + evening
 *   9. Calm Kp + Water/Earth
 *  10. Default — moderate conditions with element-specific guidance
 */

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";
export type TidalState = "rising" | "falling";

export interface EarthState {
  kp: number | null;
  schumannDeviation: number;
  isSpike: boolean;
  moonPhase: string;
  moonSign: string;
  moonElement: string;
  illumination: number;
  timeOfDay: TimeOfDay;
  tidalState: TidalState;
}

export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function generateInsight(state: EarthState): string {
  const {
    kp, schumannDeviation, isSpike,
    moonPhase, moonSign, moonElement, illumination,
    timeOfDay, tidalState,
  } = state;

  const kpVal = kp ?? 0;

  // ── 1. Schumann spike — rare, highest priority ──
  if (isSpike) {
    if (moonElement === "Water") {
      return "The Schumann resonance is spiking while the Moon transits a Water sign — an exceptionally rare alignment for emotional clearing. Crystal singing bowls tuned to D (sacral) and A (third eye) will resonate with unusual depth. Ground first with 7.83 Hz.";
    }
    return "The Schumann resonance is spiking — Earth's electromagnetic heartbeat is amplified. This is a powerful window for coherence work. Tune into 7.83 Hz with Tibetan bowls or a monochord. Sensitive individuals may feel heightened awareness and vivid dreams tonight.";
  }

  // ── 2. Geomagnetic storm (Kp ≥ 5) ──
  if (kpVal >= 5) {
    if (moonElement === "Fire") {
      return `Geomagnetic storm active (Kp ${kpVal.toFixed(1)}) with the Moon in ${moonSign} — Fire element intensifies the turbulence. Prioritise low-frequency drumming and Tibetan singing bowls to anchor root and sacral energy. Avoid high-frequency crystal bowls until conditions settle.`;
    }
    if (moonElement === "Earth") {
      return `Geomagnetic storm active (Kp ${kpVal.toFixed(1)}). The Moon in ${moonSign} offers grounding Earth energy as a counterbalance. Use monochord drones and deep voice work in the 100–200 Hz range. Keep sessions shorter than usual — sensitivity is heightened.`;
    }
    return `A geomagnetic storm is active (Kp ${kpVal.toFixed(1)}). Sensitive individuals may feel restless or fatigued. Prioritise grounding — body scanning, slow breathwork, and earth-tone resonance below 200 Hz. Postpone intense frequency sessions until conditions calm.`;
  }

  // ── 3. Full moon (illumination > 95%) ──
  if (illumination > 0.95) {
    if (moonElement === "Water") {
      return `Full Moon in ${moonSign} — a Water sign that deepens emotional release. Crystal singing bowls tuned to D (sacral chakra) and A (third eye) will support the flow. Sound baths tonight will feel especially cathartic. Allow space for tears and laughter alike.`;
    }
    if (moonElement === "Fire") {
      return `Full Moon energy floods the field through ${moonSign}'s Fire element. Overtone chanting and vocal toning will feel electrifying tonight. Channel the intensity through the solar plexus — singing bowls in E will focus the power constructively.`;
    }
    return `Full Moon energy saturates the field. ${moonElement} element through ${moonSign} shapes the release. Overtone chanting, gong baths, and high-harmonic singing bowls will feel especially potent tonight. Open windows if possible — let moonlight in.`;
  }

  // ── 4. New moon (illumination < 5%) ──
  if (illumination < 0.05) {
    if (timeOfDay === "night") {
      return `New Moon darkness — the deepest stillness of the lunar cycle. Tonight is ideal for intention-setting with a single monochord drone at 7.83 Hz. Work with ultra-low Delta frequencies (0.5–4 Hz binaural). Silence between tones carries as much power as the tones themselves.`;
    }
    return "New Moon stillness — the quietest phase of the lunar cycle. An ideal window for setting intentions, silent meditation, and receptive listening practices. If working with sound, choose a single instrument — a shruti box or tanpura drone will hold space without overwhelming.";
  }

  // ── 5. Elevated Kp (3–5) + Fire/Earth element ──
  if (kpVal >= 3 && moonElement === "Fire") {
    return `Elevated geomagnetic activity (Kp ${kpVal.toFixed(1)}) amplifies ${moonSign}'s Fire energy. Ground through body-based practice before vocal work — stomping, clapping, and percussive breath. Then channel the activation through solar plexus toning in E. Frame drum and djembe will feel especially alive.`;
  }
  if (kpVal >= 3 && moonElement === "Earth") {
    return `Elevated geomagnetic activity (Kp ${kpVal.toFixed(1)}) with the Moon in ${moonSign} — Earth element anchors the turbulence. Deep monochord sessions and didgeridoo work will ground excess energy. Focus on the root chakra with C and low D tones.`;
  }

  // ── 6. Elevated Kp (3–5) with other elements ──
  if (kpVal >= 3) {
    return `Elevated geomagnetic activity (Kp ${kpVal.toFixed(1)}) with the Moon in ${moonSign}. Ground through body-based practices — walking meditation, gentle stretching — before beginning vocal or instrument work. ${moonElement === "Water" ? "Crystal bowls in D will soothe emotional sensitivity" : "Breathwork and humming will clear mental restlessness"}.`;
  }

  // ── 7. Rising tide + morning ──
  if (tidalState === "rising" && timeOfDay === "morning") {
    return `Rising tidal energy mirrors the morning expansion. Open sessions with ascending frequency sweeps — start with a deep C drone and work upward through the harmonic series. The body's meridian energy flows upward before noon, making this ideal for voice activation and overtone singing.`;
  }

  // ── 8. Falling tide + evening ──
  if (tidalState === "falling" && timeOfDay === "evening") {
    return `Falling tide meets evening descent — the body naturally turns inward. Close the day with descending tones: start with a high crystal bowl and work down to a low Tibetan bowl or gong wash. ${moonPhase} Moon in ${moonSign} supports release and integration.`;
  }

  // ── 9. Calm Kp + Water/Earth element ──
  if (kpVal < 2 && moonElement === "Water") {
    return `Geomagnetic calm meets ${moonPhase.toLowerCase()} Moon in ${moonSign} — Water element invites deep emotional resonance. Crystal singing bowls, ocean drums, and rain sticks will attune beautifully. Consider a 7.83 Hz session to align with the Earth's heartbeat. Allow longer silences between tones.`;
  }
  if (kpVal < 2 && moonElement === "Earth") {
    return `Geomagnetic calm with ${moonPhase.toLowerCase()} Moon in ${moonSign} — Earth element grounds beautifully today. Ideal conditions for deep monochord meditation, didgeridoo journeying, or extended overtone work. Root chakra toning in C will feel especially stable and nourishing.`;
  }

  // ── 10. Calm Kp + Air/Fire ──
  if (kpVal < 2) {
    return `Geomagnetic calm meets ${moonPhase.toLowerCase()} lunar ${moonElement.toLowerCase()} energy — an ideal window for deep resonance work. ${moonElement === "Air" ? "Breathwork, flute, and high-harmonic singing will connect to mental clarity and crown expansion" : "Creative expression through voice, frame drum, and overtone singing is well-supported"}. Consider 7.83 Hz sessions to align with the Earth's natural rhythm.`;
  }

  // ── Default — moderate conditions with element-specific guidance ──
  const elementGuidance: Record<string, string> = {
    Fire: "Creative expression thrives — overtone singing, frame drum circles, and energising vocal work. Solar plexus toning in E will channel the fire constructively.",
    Water: "Emotional depth is available — crystal singing bowls, ocean drums, and gentle vocal harmonics. Sacral and heart chakra work with D and F tones flows naturally.",
    Air: "Mental clarity and connection — breathwork, Tibetan flutes, and high-harmonic overtone singing. Crown and throat chakra work with B and G tones supports expansion.",
    Earth: "Grounding and embodiment — monochord drones, didgeridoo, and deep voice work. Root chakra toning in C and low D nurtures stability and presence.",
  };

  return `The Moon in ${moonSign} (${moonElement}) shapes today's energetic landscape. ${moonPhase} energy supports gentle practice. ${elementGuidance[moonElement] ?? elementGuidance.Earth}`;
}
