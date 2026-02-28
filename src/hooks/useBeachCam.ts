import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface BeachCamData {
  name: string;
  country: string;
  snapshotUrl: string;
  localTime: string;
  temp: number | null;
  index: number;
  total: number;
}

interface BeachCamResponse extends Partial<BeachCamData> {
  error?: string;
}

export function useBeachCam() {
  const { data, error, isLoading } = useSWR<BeachCamResponse>(
    "/api/beach-cam",
    fetcher,
    {
      refreshInterval: 60 * 1000, // refresh snapshot every 60s
      revalidateOnFocus: false,
      dedupingInterval: 30 * 1000,
    },
  );

  return {
    name: data?.name ?? null,
    country: data?.country ?? "",
    snapshotUrl: data?.snapshotUrl ?? null,
    localTime: data?.localTime ?? "",
    temp: data?.temp ?? null,
    index: data?.index ?? 0,
    total: data?.total ?? 0,
    isLoading,
    error: error || data?.error,
  };
}
