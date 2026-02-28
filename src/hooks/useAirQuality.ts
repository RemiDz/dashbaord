import useSWR from "swr";
import { useGeolocation } from "./useGeolocation";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface AirQualityData {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
}

interface AirQualityResponse extends AirQualityData {
  error?: string;
}

export function useAirQuality() {
  const coords = useGeolocation();

  const key = coords
    ? `/api/air-quality?lat=${coords.lat}&lon=${coords.lon}`
    : "/api/air-quality";

  const { data, error, isLoading } = useSWR<AirQualityResponse>(
    key,
    fetcher,
    {
      refreshInterval: 30 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    },
  );

  return {
    aqi: data?.aqi ?? null,
    pm25: data?.pm25 ?? null,
    pm10: data?.pm10 ?? null,
    no2: data?.no2 ?? null,
    o3: data?.o3 ?? null,
    isLoading,
    error: error || data?.error,
  };
}
