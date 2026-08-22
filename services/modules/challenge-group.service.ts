import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptChallengeGroup } from "@/services/adapters";
import type { ChallengeGroupContract, ChallengeGroupListResponseContract } from "@/lib/contracts/challenge-group";
import type { ChallengeGroup, ChallengeGroupInput } from "@/types";

export async function listChallengeGroups(challengeId: number): Promise<ChallengeGroup[]> {
  const { data } = await client.get<ChallengeGroupListResponseContract>(
    API_ENDPOINTS.CHALLENGE_GROUP.LIST(challengeId)
  );
  return data.data.map(adaptChallengeGroup);
}

export async function createChallengeGroup(
  challengeId: number,
  input: ChallengeGroupInput
): Promise<ChallengeGroup> {
  const { data } = await client.post<ChallengeGroupContract>(API_ENDPOINTS.CHALLENGE_GROUP.CREATE(challengeId), {
    name: input.name,
    class_student_ids: input.classStudentIds,
  });
  return adaptChallengeGroup(data);
}

export async function gradeChallengeGroup(groupId: number, groupScore: number): Promise<ChallengeGroup> {
  const { data } = await client.patch<ChallengeGroupContract>(API_ENDPOINTS.CHALLENGE_GROUP.GRADE(groupId), {
    group_score: groupScore,
  });
  return adaptChallengeGroup(data);
}

export async function deleteChallengeGroup(groupId: number): Promise<void> {
  await client.delete(API_ENDPOINTS.CHALLENGE_GROUP.DELETE(groupId));
}
