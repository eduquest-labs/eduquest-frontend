import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import {
  getAttempt,
  getCurrentAttempt,
  getLatestAttempt,
  listAttemptHistory,
  listPendingGradingAttempts,
  listStudentChallenges,
} from "@/services/modules";
import type { AttemptHistoryFilters } from "@/types";

export const attemptKeys = {
  all: ["attempts"] as const,
  discovery: () => [...attemptKeys.all, "discovery"] as const,
  current: (challengeId: number) => [...attemptKeys.all, "current", challengeId] as const,
  latest: (challengeId: number) => [...attemptKeys.all, "latest", challengeId] as const,
  detail: (attemptId: number) => [...attemptKeys.all, "detail", attemptId] as const,
  history: (filters: AttemptHistoryFilters) => [...attemptKeys.all, "history", filters] as const,
  pendingGradingRoot: () => [...attemptKeys.all, "pending-grading"] as const,
  pendingGrading: (classId: number) => [...attemptKeys.pendingGradingRoot(), classId] as const,
};

export function useStudentChallenges() {
  return useQuery({
    queryKey: attemptKeys.discovery(),
    queryFn: listStudentChallenges,
  });
}

export function useCurrentAttempt(challengeId: number, enabled = true) {
  return useQuery({
    queryKey: attemptKeys.current(challengeId),
    queryFn: () => getCurrentAttempt(challengeId),
    enabled: enabled && Number.isFinite(challengeId) && challengeId > 0,
  });
}

export function useLatestAttempt(challengeId: number, enabled = true) {
  return useQuery({
    queryKey: attemptKeys.latest(challengeId),
    queryFn: () => getLatestAttempt(challengeId),
    enabled: enabled && Number.isFinite(challengeId) && challengeId > 0,
  });
}

export function useAttemptDetail(attemptId: number, enabled = true) {
  return useQuery({
    queryKey: attemptKeys.detail(attemptId),
    queryFn: () => getAttempt(attemptId),
    enabled: enabled && Number.isFinite(attemptId) && attemptId > 0,
  });
}

export function usePendingGradingAttempts(classId: number, enabled = true) {
  return useInfiniteQuery({
    queryKey: attemptKeys.pendingGrading(classId),
    queryFn: ({ pageParam }) => listPendingGradingAttempts(classId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: enabled && Number.isFinite(classId) && classId > 0,
  });
}

export function useAttemptHistory(filters: AttemptHistoryFilters = {}) {
  return useInfiniteQuery({
    queryKey: attemptKeys.history(filters),
    queryFn: ({ pageParam }) => listAttemptHistory(filters, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
