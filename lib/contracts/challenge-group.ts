export interface ChallengeGroupMemberContract {
  class_student_id: number;
  student_name: string;
}

export interface ChallengeGroupContract {
  id: number;
  challenge_id: number;
  name: string;
  group_score: string | null;
  graded_at: string | null;
  members: ChallengeGroupMemberContract[];
}

export interface ChallengeGroupListResponseContract {
  data: ChallengeGroupContract[];
}
