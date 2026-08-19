import { describe, expect, it } from "vitest";

import { adaptSchoolWithStats } from "@/services/adapters";

describe("adaptSchoolWithStats", () => {
  it("maps snake_case analytics contract fields to camelCase", () => {
    const result = adaptSchoolWithStats({
      school_id: 3,
      school_name: "SMA Negeri 1 Bandung",
      guru_count: 2,
      class_count: 5,
      student_count: 87,
    });

    expect(result).toEqual({
      id: 3,
      name: "SMA Negeri 1 Bandung",
      guruCount: 2,
      classCount: 5,
      studentCount: 87,
    });
  });
});
