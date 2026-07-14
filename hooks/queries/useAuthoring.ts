import { useQuery } from "@tanstack/react-query";

import { useChallengeAvailabilityRefresh } from "@/hooks/queries/useChallengeAvailabilityRefresh";
import { listChallenges, listQuestions, listTopics } from "@/services/modules";

export const authoringKeys = {
  all: ["authoring"] as const,
  topics: (classId: number) => [...authoringKeys.all, "topics", classId] as const,
  challenges: (topicId: number) => [...authoringKeys.all, "challenges", topicId] as const,
  questions: (challengeId: number) => [...authoringKeys.all, "questions", challengeId] as const,
};

export function useTopics(classId: number, enabled = true) {
  return useQuery({
    queryKey: authoringKeys.topics(classId),
    queryFn: () => listTopics(classId),
    enabled: enabled && Number.isFinite(classId) && classId > 0,
  });
}

export function useChallenges(topicId: number, enabled = true) {
  const query = useQuery({
    queryKey: authoringKeys.challenges(topicId),
    queryFn: () => listChallenges(topicId),
    enabled: enabled && Number.isFinite(topicId) && topicId > 0,
  });

  useChallengeAvailabilityRefresh(query.data, query.refetch);

  return query;
}

export function useQuestions(challengeId: number, enabled = true) {
  return useQuery({
    queryKey: authoringKeys.questions(challengeId),
    queryFn: () => listQuestions(challengeId),
    enabled: enabled && Number.isFinite(challengeId) && challengeId > 0,
  });
}
