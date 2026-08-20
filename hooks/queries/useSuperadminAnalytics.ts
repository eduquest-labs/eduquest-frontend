import { useQuery } from "@tanstack/react-query";

import { listSchoolComparison } from "@/services/modules";

export const superadminAnalyticsKeys = {
  all: ["superadmin-analytics"] as const,
  schoolComparison: () =>
    [...superadminAnalyticsKeys.all, "school-comparison"] as const,
};

export function useSchoolComparison() {
  return useQuery({
    queryKey: superadminAnalyticsKeys.schoolComparison(),
    queryFn: listSchoolComparison,
    retry: 1,
  });
}
