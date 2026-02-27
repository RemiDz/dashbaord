"use client";

import { useEffect, useState } from "react";

interface Coords {
  lat: number;
  lon: number;
}

/**
 * Returns the user's coordinates via the browser Geolocation API.
 * Returns null until resolved (or if permission is denied).
 * Coordinates are rounded to 4 decimal places (~11m precision).
 * Cached for 30 minutes via maximumAge.
 */
export function useGeolocation(): Coords | null {
  const [coords, setCoords] = useState<Coords | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lon: Math.round(pos.coords.longitude * 10000) / 10000,
        });
      },
      () => {
        // Permission denied or error — callers will use defaults
      },
      { timeout: 10000, maximumAge: 30 * 60 * 1000 }
    );
  }, []);

  return coords;
}
