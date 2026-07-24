import { useQuery } from "@tanstack/react-query";

import { DASHBOARD_REFETCH_INTERVAL_MS } from "@/config/constants";
import { getDosenDashboard } from "@/services/modules";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  summary: (classId: number | null) =>
    [...dashboardKeys.all, "summary", classId ?? "all"] as const,
};

export function useDashboard(classId: number | null) {
  return useQuery({
    queryKey: dashboardKeys.summary(classId),
    queryFn: () => getDosenDashboard(classId),
    refetchInterval: DASHBOARD_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    retry: 1,
  });
}
