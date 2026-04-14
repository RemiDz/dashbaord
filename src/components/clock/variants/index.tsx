"use client";

import { type ClockId } from "@/contexts/SettingsContext";
import { TartarianClock } from "../TartarianClock";
import { MinimalAnalogClock } from "./MinimalAnalogClock";
import { RomanMarbleClock } from "./RomanMarbleClock";
import { OrreryClock } from "./OrreryClock";
import { DigitalMonoClock } from "./DigitalMonoClock";
import { FlipDigitalClock } from "./FlipDigitalClock";
import { RadialBarsClock } from "./RadialBarsClock";
import { BinaryLedClock } from "./BinaryLedClock";
import { SacredGeometryClock } from "./SacredGeometryClock";
import { WordClock } from "./WordClock";

interface Props {
  variant: ClockId;
  size: number;
}

export function ClockRenderer({ variant, size }: Props) {
  switch (variant) {
    case "minimal-analog":
      return <MinimalAnalogClock size={size} />;
    case "roman-marble":
      return <RomanMarbleClock size={size} />;
    case "orrery":
      return <OrreryClock size={size} />;
    case "digital-mono":
      return <DigitalMonoClock size={size} />;
    case "flip-digital":
      return <FlipDigitalClock size={size} />;
    case "radial-bars":
      return <RadialBarsClock size={size} />;
    case "binary-led":
      return <BinaryLedClock size={size} />;
    case "sacred-geometry":
      return <SacredGeometryClock size={size} />;
    case "word-clock":
      return <WordClock size={size} />;
    case "tartarian":
    default:
      return <TartarianClock size={size} />;
  }
}
