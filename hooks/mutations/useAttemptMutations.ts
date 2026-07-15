import { useMutation, useQueryClient } from "@tanstack/react-query";

import { attemptKeys } from "@/hooks/queries";
import { finishAttempt, startAttempt, submitAttemptAnswer } from "@/services/modules";
import type { AttemptDetail, SubmitAnswerInput } from "@/types";

export function useStartAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: startAttempt,
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.current(attempt.challengeId), attempt);
      queryClient.setQueryData(attemptKeys.detail(attempt.id), attempt);
    },
  });
}

export function useSubmitAttemptAnswer(attemptId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitAnswerInput) => submitAttemptAnswer(attemptId, input),
    onSuccess: (answer) => {
      queryClient.setQueryData<AttemptDetail>(attemptKeys.detail(attemptId), (current) => {
        if (!current) return current;
        const exists = current.answers.some((item) => item.id === answer.id);
        return {
          ...current,
          answers: exists
            ? current.answers.map((item) => (item.id === answer.id ? answer : item))
            : [...current.answers, answer],
        };
      });
    },
  });
}

export function useFinishAttempt(challengeId: number, attemptId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => finishAttempt(attemptId),
    onSuccess: (attempt) => {
      queryClient.setQueryData(attemptKeys.detail(attemptId), attempt);
      queryClient.setQueryData(attemptKeys.current(challengeId), null);
    },
  });
}
