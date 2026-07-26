import { useQuery } from "@tanstack/react-query";

import { MONITORING_REFETCH_INTERVAL_MS } from "@/config/constants";
import { getMonitoring } from "@/services/modules";

export const monitoringKeys = {
  all: ["monitoring"] as const,
  feed: (classId: number | null) =>
    [...monitoringKeys.all, "feed", classId ?? "all"] as const,
};

export function useMonitoring(
  classId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: monitoringKeys.feed(classId),
    queryFn: () => getMonitoring(classId),
    enabled,
    refetchInterval: MONITORING_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}
