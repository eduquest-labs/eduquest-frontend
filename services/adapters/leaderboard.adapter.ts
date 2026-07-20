import type {
  LeaderboardResponseContract,
  LeaderboardTopicContract,
  ProgressTrackerResponseContract,
} from "@/lib/contracts/leaderboard";
import type {
  LeaderboardData,
  LeaderboardTopic,
  StudentProgress,
} from "@/types";

function adaptLeaderboardTopic(
  contract: LeaderboardTopicContract
): LeaderboardTopic {
  return { id: contract.id, name: contract.name };
}

export function adaptLeaderboard(
  contract: LeaderboardResponseContract
): LeaderboardData {
  return {
    classInfo: contract.class,
    topic: contract.topic ? adaptLeaderboardTopic(contract.topic) : null,
    topics: contract.topics.map(adaptLeaderboardTopic),
    entries: contract.data.map((entry) => ({
      rank: entry.rank,
      classStudentId: entry.class_student_id,
      studentName: entry.student_name,
      score: entry.score,
    })),
  };
}

export function adaptStudentProgress(
  contract: ProgressTrackerResponseContract
): StudentProgress {
  return {
    classInfo: contract.class,
    student: {
      id: contract.student.id,
      classStudentId: contract.student.class_student_id,
      name: contract.student.name,
    },
    topic: contract.topic ? adaptLeaderboardTopic(contract.topic) : null,
    completedChallenges: contract.completed_challenges,
    totalChallenges: contract.total_challenges,
    percentage: contract.percentage,
  };
}
