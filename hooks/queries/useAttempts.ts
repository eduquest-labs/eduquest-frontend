import { useQuery } from "@tanstack/react-query";

import { getAttempt, getCurrentAttempt, listStudentChallenges } from "@/services/modules";

export const attemptKeys = {
  all: ["attempts"] as const,
  discovery: () => [...attemptKeys.all, "discovery"] as const,
  current: (challengeId: number) => [...attemptKeys.all, "current", challengeId] as const,
  detail: (attemptId: number) => [...attemptKeys.all, "detail", attemptId] as const,
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

export function useAttemptDetail(attemptId: number, enabled = true) {
  return useQuery({
    queryKey: attemptKeys.detail(attemptId),
    queryFn: () => getAttempt(attemptId),
    enabled: enabled && Number.isFinite(attemptId) && attemptId > 0,
  });
}
