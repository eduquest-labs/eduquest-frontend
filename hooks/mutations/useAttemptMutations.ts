import { useMutation, useQueryClient } from "@tanstack/react-query";

import { attemptKeys } from "@/hooks/queries";
import {
  downloadAnswerAttachment,
  finishAttempt,
  getLatestAttempt,
  gradeEssayAnswer,
  startAttempt,
  submitAttemptAnswer,
} from "@/services/modules";
import type { AttemptDetail, GradeEssayInput, SubmitAnswerInput } from "@/types";

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

/**
 * Decides whether opening a challenge should resume an in-progress attempt
 * (creating one if none exists) or route to the read-only result page,
 * since a locked attempt can no longer be resumed via startAttempt.
 */
export function useOpenChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (challengeId: number): Promise<{ path: string }> => {
      const latest = await getLatestAttempt(challengeId);
      if (latest?.isLocked) {
        return { path: `/siswa/challenges/${challengeId}/result` };
      }

      const attempt = await startAttempt(challengeId);
      queryClient.setQueryData(attemptKeys.current(challengeId), attempt);
      queryClient.setQueryData(attemptKeys.detail(attempt.id), attempt);
      return { path: `/siswa/challenges/${challengeId}` };
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

export function useGradeEssay(classId: number, attemptId: number, answerId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GradeEssayInput) => gradeEssayAnswer(answerId, input),
    onSuccess: (result) => {
      queryClient.setQueryData<AttemptDetail>(attemptKeys.detail(attemptId), (current) => {
        if (!current) return current;
        return {
          ...current,
          totalScore: result.attempt.totalScore,
          gradingStatus: result.attempt.gradingStatus,
          answers: current.answers.map((answer) =>
            answer.id === result.answer.id ? result.answer : answer
          ),
        };
      });
      void queryClient.invalidateQueries({ queryKey: attemptKeys.pendingGrading(classId) });
    },
  });
}

export function useDownloadAnswerAttachment() {
  return useMutation({
    mutationFn: downloadAnswerAttachment,
  });
}
