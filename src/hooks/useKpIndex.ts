import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface KpEntry {
  timestamp: string;
  kp: number;
}

interface KpResponse {
  current: number | null;
  history: KpEntry[];
  error?: string;
}

export function useKpIndex() {
  const { data, error, isLoading } = useSWR<KpResponse>("/api/kp", fetcher, {
    refreshInterval: 15 * 60 * 1000,
    revalidateOnFocus: false,
    dedupingInterval: 60 * 1000,
  });

  return {
    current: data?.current ?? null,
    history: data?.history ?? [],
    isElevated: (data?.current ?? 0) >= 3,
    isStorm: (data?.current ?? 0) >= 5,
    isLoading,
    error: error || data?.error,
  };
}
