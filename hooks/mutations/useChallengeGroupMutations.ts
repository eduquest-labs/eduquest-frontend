import { useMutation, useQueryClient } from "@tanstack/react-query";

import { challengeGroupKeys } from "@/hooks/queries";
import { createChallengeGroup, deleteChallengeGroup, gradeChallengeGroup } from "@/services/modules";
import type { ChallengeGroupInput } from "@/types";

export function useCreateChallengeGroup(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChallengeGroupInput) => createChallengeGroup(challengeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeGroupKeys.list(challengeId) });
    },
  });
}

export function useGradeChallengeGroup(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, groupScore }: { groupId: number; groupScore: number }) =>
      gradeChallengeGroup(groupId, groupScore),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeGroupKeys.list(challengeId) });
    },
  });
}

export function useDeleteChallengeGroup(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (groupId: number) => deleteChallengeGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: challengeGroupKeys.list(challengeId) });
    },
  });
}
