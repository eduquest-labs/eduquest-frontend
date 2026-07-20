export interface LeaderboardTopicContract {
  id: number;
  name: string;
}

export interface LeaderboardEntryContract {
  rank: number;
  class_student_id: number;
  student_name: string;
  score: number;
}

export interface LeaderboardResponseContract {
  class: { id: number; name: string };
  topic: LeaderboardTopicContract | null;
  topics: LeaderboardTopicContract[];
  data: LeaderboardEntryContract[];
}

export interface ProgressTrackerResponseContract {
  class: { id: number; name: string };
  student: { id: number; class_student_id: number; name: string };
  topic: LeaderboardTopicContract | null;
  completed_challenges: number;
  total_challenges: number;
  percentage: number;
}
