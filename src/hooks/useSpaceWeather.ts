import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface SpaceWeatherAlert {
  message: string;
  severity: "green" | "yellow" | "orange" | "red";
  type: string;
  issued: string;
}

interface SpaceWeatherResponse {
  alerts: SpaceWeatherAlert[];
  solarWindSpeed: number | null;
  solarWindSpeedTrend: "rising" | "falling" | "stable";
  bzComponent: number | null;
  bzDirection: "north" | "south" | "neutral";
  protonDensity: number | null;
  geomagScale: string;
  solarRadScale: string;
  radioBlackout: string;
  error?: string;
}

export function useSpaceWeather() {
  const { data, error, isLoading } = useSWR<SpaceWeatherResponse>(
    "/api/space-weather",
    fetcher,
    {
      refreshInterval: 10 * 60 * 1000, // 10 minutes
      revalidateOnFocus: false,
      dedupingInterval: 2 * 60 * 1000,
    },
  );

  return {
    alerts: data?.alerts ?? [],
    solarWindSpeed: data?.solarWindSpeed ?? null,
    solarWindSpeedTrend: data?.solarWindSpeedTrend ?? "stable",
    bzComponent: data?.bzComponent ?? null,
    bzDirection: data?.bzDirection ?? "neutral",
    protonDensity: data?.protonDensity ?? null,
    geomagScale: data?.geomagScale ?? "G0",
    solarRadScale: data?.solarRadScale ?? "S0",
    radioBlackout: data?.radioBlackout ?? "R0",
    isLoading,
    error: error || data?.error,
  };
}
