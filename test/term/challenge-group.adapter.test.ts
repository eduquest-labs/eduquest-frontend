import { describe, expect, it } from "vitest";

import { adaptChallengeGroup } from "@/services/adapters";

describe("adaptChallengeGroup", () => {
  it("adapts a group with a null score", () => {
    const result = adaptChallengeGroup({
      id: 1,
      challenge_id: 2,
      name: "Kelompok A",
      group_score: null,
      graded_at: null,
      members: [{ class_student_id: 3, student_name: "Budi" }],
    });

    expect(result).toEqual({
      id: 1,
      challengeId: 2,
      name: "Kelompok A",
      groupScore: null,
      gradedAt: null,
      members: [{ classStudentId: 3, studentName: "Budi" }],
    });
  });

  it("adapts a group with a numeric score string", () => {
    const result = adaptChallengeGroup({
      id: 1,
      challenge_id: 2,
      name: "Kelompok A",
      group_score: "85.00",
      graded_at: "2026-08-22T10:00:00+07:00",
      members: [],
    });

    expect(result.groupScore).toBe(85);
  });
});
