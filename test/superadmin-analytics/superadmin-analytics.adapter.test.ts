import { describe, expect, it } from "vitest";

import { adaptSchoolComparison } from "@/services/adapters";

describe("adaptSchoolComparison", () => {
  it("maps snake_case contract fields to camelCase", () => {
    const result = adaptSchoolComparison({
      school_id: 1,
      school_name: "SMA Negeri 1 Bandung",
      student_count: 18,
      locked_attempt_count: 24,
      scored_attempt_count: 20,
      average_score: 78.25,
      minimum_score: 40,
      maximum_score: 100,
      median_score: 80,
    });

    expect(result).toEqual({
      schoolId: 1,
      schoolName: "SMA Negeri 1 Bandung",
      studentCount: 18,
      lockedAttemptCount: 24,
      scoredAttemptCount: 20,
      averageScore: 78.25,
      minimumScore: 40,
      maximumScore: 100,
      medianScore: 80,
    });
  });

  it("passes through null scores for schools without final scores", () => {
    const result = adaptSchoolComparison({
      school_id: 2,
      school_name: "SMA Kosong",
      student_count: 0,
      locked_attempt_count: 0,
      scored_attempt_count: 0,
      average_score: null,
      minimum_score: null,
      maximum_score: null,
      median_score: null,
    });

    expect(result.averageScore).toBeNull();
    expect(result.minimumScore).toBeNull();
  });
});
