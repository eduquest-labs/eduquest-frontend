import { useQuery } from "@tanstack/react-query";

import { listChallengeGroups } from "@/services/modules";

export const challengeGroupKeys = {
  all: ["challenge-group"] as const,
  list: (challengeId: number) => [...challengeGroupKeys.all, "list", challengeId] as const,
};

export function useChallengeGroups(challengeId: number, enabled = true) {
  return useQuery({
    queryKey: challengeGroupKeys.list(challengeId),
    queryFn: () => listChallengeGroups(challengeId),
    enabled,
  });
}
