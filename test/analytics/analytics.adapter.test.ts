import { describe, expect, it } from "vitest";

import { adaptClassComparison } from "@/services/adapters";

describe("analytics adapter", () => {
  it("mengubah contract snake_case dan mempertahankan statistik nullable", () => {
    expect(
      adaptClassComparison({
        class_id: 4,
        class_name: "Sekolah A",
        student_count: 18,
        locked_attempt_count: 24,
        scored_attempt_count: 20,
        average_score: 78.25,
        minimum_score: 40,
        maximum_score: 100,
        median_score: 80,
      })
    ).toEqual({
      classId: 4,
      className: "Sekolah A",
      studentCount: 18,
      lockedAttemptCount: 24,
      scoredAttemptCount: 20,
      averageScore: 78.25,
      minimumScore: 40,
      maximumScore: 100,
      medianScore: 80,
    });

    expect(
      adaptClassComparison({
        class_id: 5,
        class_name: "Sekolah B",
        student_count: 10,
        locked_attempt_count: 0,
        scored_attempt_count: 0,
        average_score: null,
        minimum_score: null,
        maximum_score: null,
        median_score: null,
      })
    ).toMatchObject({
      averageScore: null,
      minimumScore: null,
      maximumScore: null,
      medianScore: null,
    });
  });
});
