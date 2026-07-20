import type {
  LeaderboardResponseContract,
  ProgressTrackerResponseContract,
} from "@/lib/contracts/leaderboard";
import {
  adaptLeaderboard,
  adaptStudentProgress,
} from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { LeaderboardData, StudentProgress } from "@/types";

function topicParams(topicId: number | null) {
  return topicId === null ? undefined : { topic_id: topicId };
}

export async function getLeaderboard(
  classId: number,
  topicId: number | null
): Promise<LeaderboardData> {
  const { data } = await client.get<LeaderboardResponseContract>(
    API_ENDPOINTS.LEADERBOARD.RANKING(classId),
    { params: topicParams(topicId) }
  );

  return adaptLeaderboard(data);
}

export async function getStudentProgress(
  classId: number,
  classStudentId: number,
  topicId: number | null
): Promise<StudentProgress> {
  const { data } = await client.get<ProgressTrackerResponseContract>(
    API_ENDPOINTS.LEADERBOARD.PROGRESS(classId, classStudentId),
    { params: topicParams(topicId) }
  );

  return adaptStudentProgress(data);
}
