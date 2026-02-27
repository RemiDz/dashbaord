import useSWR from "swr";
import { useGeolocation } from "./useGeolocation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface TidalEvent {
  time: string;
  height: number;
  type: "high" | "low";
}

export interface HourlyPoint {
  time: string;
  height: number;
}

interface TidalResponse {
  events: TidalEvent[];
  hourly: HourlyPoint[];
  location: string;
  error?: string;
}

export function useTidalData() {
  const coords = useGeolocation();

  const key = coords
    ? `/api/tidal?lat=${coords.lat}&lon=${coords.lon}`
    : "/api/tidal";

  const { data, error, isLoading } = useSWR<TidalResponse>(
    key,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    }
  );

  const events = data?.events ?? [];
  const hourly = data?.hourly ?? [];

  // Derive current tide state from events
  const now = new Date();
  let nextHigh: TidalEvent | null = null;
  let nextLow: TidalEvent | null = null;
  let prevHigh: TidalEvent | null = null;
  let prevLow: TidalEvent | null = null;

  for (const e of events) {
    const t = new Date(e.time);
    if (t > now) {
      if (e.type === "high" && !nextHigh) nextHigh = e;
      if (e.type === "low" && !nextLow) nextLow = e;
    } else {
      if (e.type === "high") prevHigh = e;
      if (e.type === "low") prevLow = e;
    }
  }

  // Estimate current height from nearest hourly point
  let currentHeight: number | null = null;
  if (hourly.length > 0) {
    let closest = hourly[0];
    let minDist = Infinity;
    for (const p of hourly) {
      const diff = Math.abs(new Date(p.time).getTime() - now.getTime());
      if (diff < minDist) {
        minDist = diff;
        closest = p;
      }
    }
    currentHeight = closest.height;
  }

  // Determine if tide is rising: if next event is a high, tide is rising
  const rising = nextHigh && nextLow
    ? new Date(nextHigh.time) < new Date(nextLow.time)
    : true;

  return {
    events,
    hourly,
    location: data?.location ?? "—",
    currentHeight,
    rising,
    nextHigh,
    nextLow,
    prevHigh,
    prevLow,
    isLoading,
    error: error || data?.error,
  };
}
