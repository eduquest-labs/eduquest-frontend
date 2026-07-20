export interface LeaderboardTopic {
  id: number;
  name: string;
}

export interface LeaderboardEntry {
  rank: number;
  classStudentId: number;
  studentName: string;
  score: number;
}

export interface LeaderboardData {
  classInfo: { id: number; name: string };
  topic: LeaderboardTopic | null;
  topics: LeaderboardTopic[];
  entries: LeaderboardEntry[];
}

export interface StudentProgress {
  classInfo: { id: number; name: string };
  student: { id: number; classStudentId: number; name: string };
  topic: LeaderboardTopic | null;
  completedChallenges: number;
  totalChallenges: number;
  percentage: number;
}
