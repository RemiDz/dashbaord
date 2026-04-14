"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId =
  | "celestial-silver"
  | "tartarian-brass"
  | "obsidian-nebula"
  | "forest-ether"
  | "rose-quartz"
  | "solar-dawn"
  | "mono-graphite"
  | "aurora-frost";

export type ClockId =
  | "tartarian"
  | "minimal-analog"
  | "roman-marble"
  | "orrery"
  | "digital-mono"
  | "flip-digital"
  | "radial-bars"
  | "binary-led"
  | "sacred-geometry"
  | "word-clock";

export interface ThemeDescriptor {
  id: ThemeId;
  name: string;
  tagline: string;
  /** Tiny preview swatches shown in the picker */
  swatches: [string, string, string];
}

export interface ClockDescriptor {
  id: ClockId;
  name: string;
  description: string;
  kind: "analog" | "digital" | "innovative";
}

export const THEMES: ThemeDescriptor[] = [
  {
    id: "celestial-silver",
    name: "Celestial Silver",
    tagline: "Selenite and deep indigo",
    swatches: ["#F0EEF8", "#0A0A2E", "#C8C4DC"],
  },
  {
    id: "tartarian-brass",
    name: "Tartarian Brass",
    tagline: "Ornamental warm copper",
    swatches: ["#E8C97A", "#1A1008", "#C58A3A"],
  },
  {
    id: "obsidian-nebula",
    name: "Obsidian Nebula",
    tagline: "Magenta dust in the void",
    swatches: ["#E6B3FF", "#0B0418", "#9D5BFF"],
  },
  {
    id: "forest-ether",
    name: "Forest Ether",
    tagline: "Aurora over moss",
    swatches: ["#8CE8B8", "#061A14", "#3AA37A"],
  },
  {
    id: "rose-quartz",
    name: "Rose Quartz",
    tagline: "Soft petal luminance",
    swatches: ["#FFC7D9", "#1D0A14", "#E67AA4"],
  },
  {
    id: "solar-dawn",
    name: "Solar Dawn",
    tagline: "Amber horizon light",
    swatches: ["#FFD48A", "#1A0E05", "#FF9845"],
  },
  {
    id: "mono-graphite",
    name: "Mono Graphite",
    tagline: "Quiet achromatic ambience",
    swatches: ["#F0F0F0", "#0A0A0A", "#9A9A9A"],
  },
  {
    id: "aurora-frost",
    name: "Aurora Frost",
    tagline: "Glacial cyan and violet",
    swatches: ["#A8F0FF", "#03101F", "#8A9EFF"],
  },
];

export const CLOCKS: ClockDescriptor[] = [
  { id: "tartarian", name: "Tartarian", description: "Engraved observatory with Roman numerals.", kind: "analog" },
  { id: "minimal-analog", name: "Minimal", description: "Hairline ticks, precise hands.", kind: "analog" },
  { id: "roman-marble", name: "Roman Marble", description: "Monumental numerals on marble.", kind: "analog" },
  { id: "orrery", name: "Solar Orrery", description: "Sun and moon orbit the hour.", kind: "innovative" },
  { id: "digital-mono", name: "Digital Mono", description: "Large mono numerals.", kind: "digital" },
  { id: "flip-digital", name: "Flip Board", description: "Split-flap style numerals.", kind: "digital" },
  { id: "radial-bars", name: "Radial Bars", description: "Concentric arcs for hour/minute/second.", kind: "innovative" },
  { id: "binary-led", name: "Binary LED", description: "BCD columns of glowing dots.", kind: "innovative" },
  { id: "sacred-geometry", name: "Sacred Geometry", description: "Flower of life pulsing at seconds.", kind: "innovative" },
  { id: "word-clock", name: "Word Clock", description: "It is quarter past three.", kind: "innovative" },
];

interface Settings {
  theme: ThemeId;
  clock: ClockId;
}

interface SettingsContextShape {
  theme: ThemeId;
  clock: ClockId;
  setTheme: (id: ThemeId) => void;
  setClock: (id: ClockId) => void;
}

const STORAGE_KEY = "harmonic-waves-settings-v1";
const DEFAULTS: Settings = { theme: "celestial-silver", clock: "tartarian" };

const SettingsContext = createContext<SettingsContextShape | null>(null);

function loadSettings(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      theme: (THEMES.some((t) => t.id === parsed.theme) ? parsed.theme : DEFAULTS.theme) as ThemeId,
      clock: (CLOCKS.some((c) => c.id === parsed.clock) ? parsed.clock : DEFAULTS.clock) as ClockId,
    };
  } catch {
    return DEFAULTS;
  }
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = settings.theme;
  }, [settings.theme]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Private-browsing or full storage — non-critical
    }
  }, [settings]);

  const setTheme = useCallback((id: ThemeId) => {
    setSettings((s) => (s.theme === id ? s : { ...s, theme: id }));
  }, []);
  const setClock = useCallback((id: ClockId) => {
    setSettings((s) => (s.clock === id ? s : { ...s, clock: id }));
  }, []);

  const value = useMemo(
    () => ({ theme: settings.theme, clock: settings.clock, setTheme, setClock }),
    [settings.theme, settings.clock, setTheme, setClock],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextShape {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
