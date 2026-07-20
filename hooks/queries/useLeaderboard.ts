import { useQuery } from "@tanstack/react-query";

import { LEADERBOARD_REFETCH_INTERVAL_MS } from "@/config/constants";
import { getLeaderboard } from "@/services/modules";

export const leaderboardKeys = {
  all: ["leaderboard"] as const,
  ranking: (classId: number, topicId: number | null) =>
    [...leaderboardKeys.all, "ranking", classId, topicId] as const,
  progress: (
    classId: number,
    classStudentId: number,
    topicId: number | null
  ) =>
    [
      ...leaderboardKeys.all,
      "progress",
      classId,
      classStudentId,
      topicId,
    ] as const,
};

export function useLeaderboard(
  classId: number,
  topicId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: leaderboardKeys.ranking(classId, topicId),
    queryFn: () => getLeaderboard(classId, topicId),
    enabled: enabled && Number.isFinite(classId) && classId > 0,
    refetchInterval: LEADERBOARD_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
    placeholderData: (previousData) =>
      previousData?.classInfo.id === classId ? previousData : undefined,
  });
}
