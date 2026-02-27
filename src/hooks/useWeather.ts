import useSWR from "swr";
import { useGeolocation } from "./useGeolocation";

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

export function useWeather() {
  const coords = useGeolocation();

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
