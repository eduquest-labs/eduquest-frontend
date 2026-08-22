export interface ChallengeGroupMember {
  classStudentId: number;
  studentName: string;
}

export interface ChallengeGroup {
  id: number;
  challengeId: number;
  name: string;
  groupScore: number | null;
  gradedAt: string | null;
  members: ChallengeGroupMember[];
}

export interface ChallengeGroupInput {
  name: string;
  classStudentIds: number[];
}
