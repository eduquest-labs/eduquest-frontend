import { useQuery } from "@tanstack/react-query";

import { LEADERBOARD_REFETCH_INTERVAL_MS } from "@/config/constants";
import { leaderboardKeys } from "@/hooks/queries/useLeaderboard";
import { getStudentProgress } from "@/services/modules";

export function useProgress(
  classId: number,
  classStudentId: number,
  topicId: number | null,
  enabled = true
) {
  return useQuery({
    queryKey: leaderboardKeys.progress(classId, classStudentId, topicId),
    queryFn: () => getStudentProgress(classId, classStudentId, topicId),
    enabled:
      enabled &&
      Number.isFinite(classId) &&
      classId > 0 &&
      Number.isFinite(classStudentId) &&
      classStudentId > 0,
    refetchInterval: LEADERBOARD_REFETCH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}
