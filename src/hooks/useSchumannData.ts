import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface SchumannEntry {
  timestamp: string;
  frequency: number;
}

interface SchumannResponse {
  current: number | null;
  history: SchumannEntry[];
  error?: string;
}

export function useSchumannData() {
  const { data, error, isLoading } = useSWR<SchumannResponse>(
    "/api/schumann",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    }
  );

  const current = data?.current ?? null;
  const deviation = current !== null ? Math.abs(current - 7.83) : 0;

  return {
    current,
    history: data?.history ?? [],
    /** Absolute deviation from 7.83 Hz base */
    deviation,
    /** True when frequency is within 0.5 Hz of base resonance */
    nearResonance: deviation < 0.5,
    /** True when deviation exceeds 1.5 Hz (spike condition) */
    isSpike: deviation > 1.5,
    isLoading,
    error: error || data?.error,
  };
}
