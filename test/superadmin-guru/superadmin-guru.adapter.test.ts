import { describe, expect, it } from "vitest";

import { adaptGuruAnalytics, adaptGuruListItem } from "@/services/adapters";

describe("adaptGuruListItem", () => {
  it("maps snake_case list contract fields to camelCase", () => {
    const result = adaptGuruListItem({
      id: 5,
      name: "Bu Sari",
      email: "sari@example.com",
      school_id: 2,
      is_active: true,
    });

    expect(result).toEqual({
      id: 5,
      name: "Bu Sari",
      email: "sari@example.com",
      schoolId: 2,
      isActive: true,
    });
  });
});

describe("adaptGuruAnalytics", () => {
  it("maps snake_case analytics contract fields to camelCase", () => {
    const result = adaptGuruAnalytics({
      guru_id: 5,
      guru_name: "Bu Sari",
      school_name: "SMA Negeri 1 Bandung",
      class_count: 3,
      student_count: 42,
    });

    expect(result).toEqual({
      schoolName: "SMA Negeri 1 Bandung",
      classCount: 3,
      studentCount: 42,
    });
  });
});
