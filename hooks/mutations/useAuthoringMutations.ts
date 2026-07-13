import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authoringKeys } from "@/hooks/queries";
import {
  createChallenge,
  createQuestion,
  createTopic,
  deleteChallenge,
  deleteQuestion,
  deleteTopic,
  duplicateChallenge,
  publishChallenge,
  unpublishChallenge,
  updateChallenge,
  updateQuestion,
  updateTopic,
} from "@/services/modules";
import type {
  ChallengeInput,
  PublishedQuestionUpdateInput,
  QuestionInput,
  TopicInput,
} from "@/types";

export function useCreateTopic(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TopicInput) => createTopic(classId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authoringKeys.topics(classId) }),
  });
}

export function useUpdateTopic(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, input }: { topicId: number; input: Partial<TopicInput> }) =>
      updateTopic(topicId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authoringKeys.topics(classId) }),
  });
}

export function useDeleteTopic(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTopic,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: authoringKeys.topics(classId) }),
  });
}

export function useCreateChallenge(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ChallengeInput) => createChallenge(topicId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.challenges(topicId) }),
  });
}

export function useUpdateChallenge(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, input }: { challengeId: number; input: Partial<ChallengeInput> }) =>
      updateChallenge(challengeId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.challenges(topicId) }),
  });
}

export function useDeleteChallenge(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChallenge,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.challenges(topicId) }),
  });
}

export function useSetChallengePublished(topicId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, published }: { challengeId: number; published: boolean }) =>
      published ? publishChallenge(challengeId) : unpublishChallenge(challengeId),
    onSuccess: (challenge) => {
      queryClient.setQueryData(
        authoringKeys.challenges(topicId),
        (current: typeof challenge[] | undefined) =>
          current?.map((item) => (item.id === challenge.id ? challenge : item))
      );
    },
  });
}

export function useDuplicateChallenge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ challengeId, targetTopicId }: { challengeId: number; targetTopicId: number }) =>
      duplicateChallenge(challengeId, targetTopicId),
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.challenges(variables.targetTopicId) }),
  });
}

export function useCreateQuestion(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: QuestionInput) => createQuestion(challengeId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.questions(challengeId) }),
  });
}

export function useUpdateQuestion(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      input,
    }: {
      questionId: number;
      input: Partial<QuestionInput> | PublishedQuestionUpdateInput;
    }) => updateQuestion(questionId, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.questions(challengeId) }),
  });
}

export function useDeleteQuestion(challengeId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: authoringKeys.questions(challengeId) }),
  });
}
