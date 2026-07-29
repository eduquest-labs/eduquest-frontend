import { useQuery } from "@tanstack/react-query";

import { getClassComparison, getProgressChart } from "@/services/modules";

export const analyticsKeys = {
  all: ["analytics"] as const,
  classComparison: () =>
    [...analyticsKeys.all, "class-comparison"] as const,
  progressChart: (classId: number, studentId?: number) =>
    [
      ...analyticsKeys.all,
      "progress-chart",
      classId,
      studentId ?? "class",
    ] as const,
};

export function useClassComparison() {
  return useQuery({
    queryKey: analyticsKeys.classComparison(),
    queryFn: getClassComparison,
    retry: 1,
  });
}

export function useProgressChart(classId: number, studentId?: number) {
  return useQuery({
    queryKey: analyticsKeys.progressChart(classId, studentId),
    queryFn: () => getProgressChart(classId, studentId),
    retry: 1,
  });
}
