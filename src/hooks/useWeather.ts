import { useEffect, useState } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface CurrentWeather {
  icon: string;
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

export interface ForecastDay {
  day: string;
  icon: string;
  high: number;
  low: number;
}

interface WeatherResponse {
  current: CurrentWeather | null;
  forecast: ForecastDay[];
  location?: string;
  error?: string;
}

function useGeolocation() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

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
        // Permission denied or error — API route will use server-side defaults
      },
      { timeout: 10000, maximumAge: 30 * 60 * 1000 }
    );
  }, []);

  return coords;
}

export function useWeather() {
  const coords = useGeolocation();

  // Build SWR key with coordinates when available
  const key = coords
    ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}`
    : "/api/weather";

  const { data, error, isLoading } = useSWR<WeatherResponse>(
    key,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    }
  );

  return {
    current: data?.current ?? null,
    forecast: data?.forecast ?? [],
    location: data?.location ?? "",
    isLoading,
    error: error || data?.error,
  };
}
