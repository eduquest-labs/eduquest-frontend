import { useQuery } from "@tanstack/react-query";

import { getClassComparison } from "@/services/modules";

export const analyticsKeys = {
  all: ["analytics"] as const,
  classComparison: () =>
    [...analyticsKeys.all, "class-comparison"] as const,
};

export function useClassComparison() {
  return useQuery({
    queryKey: analyticsKeys.classComparison(),
    queryFn: getClassComparison,
    retry: 1,
  });
}
