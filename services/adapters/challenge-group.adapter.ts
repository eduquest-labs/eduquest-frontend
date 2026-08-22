import type { ChallengeGroupContract } from "@/lib/contracts/challenge-group";
import type { ChallengeGroup } from "@/types";

export function adaptChallengeGroup(contract: ChallengeGroupContract): ChallengeGroup {
  return {
    id: contract.id,
    challengeId: contract.challenge_id,
    name: contract.name,
    groupScore: contract.group_score === null ? null : Number(contract.group_score),
    gradedAt: contract.graded_at,
    members: contract.members.map((member) => ({
      classStudentId: member.class_student_id,
      studentName: member.student_name,
    })),
  };
}
