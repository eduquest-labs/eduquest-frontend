import { useQuery } from "@tanstack/react-query";

import { getMyTerms, getTermProgress, getThresholdHistory, listTerms } from "@/services/modules";

export const termKeys = {
  all: ["term"] as const,
  list: (classId: number) => [...termKeys.all, "list", classId] as const,
  thresholdHistory: (termId: number) => [...termKeys.all, "threshold-history", termId] as const,
  progress: (termId: number) => [...termKeys.all, "progress", termId] as const,
  myTerms: () => [...termKeys.all, "my-terms"] as const,
};

export function useTerms(classId: number, enabled = true) {
  return useQuery({
    queryKey: termKeys.list(classId),
    queryFn: () => listTerms(classId),
    enabled: enabled && Number.isFinite(classId),
  });
}

export function useTermThresholdHistory(termId: number, enabled: boolean) {
  return useQuery({
    queryKey: termKeys.thresholdHistory(termId),
    queryFn: () => getThresholdHistory(termId),
    enabled,
  });
}

export function useTermProgress(termId: number, enabled: boolean) {
  return useQuery({
    queryKey: termKeys.progress(termId),
    queryFn: () => getTermProgress(termId),
    enabled,
  });
}

export function useMyTerms() {
  return useQuery({
    queryKey: termKeys.myTerms(),
    queryFn: getMyTerms,
  });
}
