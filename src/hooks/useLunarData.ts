import useSWR from "swr";
import { calculateLunarData, type LunarData } from "@/lib/lunar-calc";

/**
 * Client-side lunar data hook.
 * No API call — calculates from astronomical algorithms.
 * SWR is used purely for its refresh/caching lifecycle.
 */
function lunarFetcher(): LunarData {
  return calculateLunarData(new Date());
}

export function useLunarData() {
  const { data, error, isLoading } = useSWR<LunarData>(
    "lunar-calc",
    lunarFetcher,
    {
      refreshInterval: 60 * 60 * 1000,
      revalidateOnFocus: false,
      dedupingInterval: 5 * 60 * 1000,
    }
  );

  return {
    phase: data?.phase ?? 0,
    illumination: data?.illumination ?? 0,
    phaseName: data?.phaseName ?? "—",
    sign: data?.sign ?? "—",
    signSymbol: data?.signSymbol ?? "",
    element: data?.element ?? "—",
    elementSymbol: data?.elementSymbol ?? "",
    nextFull: data?.nextFull ?? "—",
    nextNew: data?.nextNew ?? "—",
    voidOfCourse: data?.voidOfCourse ?? "—",
    eclipticLongitude: data?.eclipticLongitude ?? 0,
    isFullMoon: (data?.illumination ?? 0) > 0.95,
    isNewMoon: (data?.illumination ?? 0) < 0.05,
    isLoading,
    error,
  };
}
