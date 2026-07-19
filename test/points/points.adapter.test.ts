import { describe, expect, it } from "vitest";

import {
  adaptBadge,
  adaptMyPoints,
  adaptStudentPointsDetail,
} from "@/services/adapters";

describe("points adapters", () => {
  it("mengadaptasi badge dan kriteria", () => {
    expect(
      adaptBadge({
        id: 1,
        name: "Pemburu Poin",
        description: null,
        criteria_type: "total_points",
        criteria_value: 100,
      })
    ).toEqual({
      id: 1,
      name: "Pemburu Poin",
      description: null,
      criteriaType: "total_points",
      criteriaValue: 100,
    });
  });

  it("mengadaptasi detail poin, adjustment, dan badge", () => {
    const detail = adaptStudentPointsDetail({
      class: { id: 2, name: "Kelas A" },
      student: { id: 3, class_student_id: 4, name: "Budi" },
      total_points: 75,
      last_synced_at: "2026-07-20T08:00:00+07:00",
      adjustments: [
        {
          id: 5,
          points: -10,
          reason: "Koreksi",
          adjusted_by: { id: 6, name: "Dosen" },
          created_at: "2026-07-20T08:00:00+07:00",
        },
      ],
      badges: [
        {
          id: 7,
          badge: {
            id: 1,
            name: "Pemburu Poin",
            description: null,
            criteria_type: "total_points",
            criteria_value: 50,
          },
          awarded_at: "2026-07-20T08:00:00+07:00",
          awarded_by: null,
          award_source: "automatic",
        },
      ],
    });

    expect(detail).toMatchObject({
      classInfo: { id: 2 },
      student: { classStudentId: 4 },
      totalPoints: 75,
    });
    expect(detail.adjustments[0]).toMatchObject({ points: -10, adjustedBy: { name: "Dosen" } });
    expect(detail.badges[0]).toMatchObject({ awardSource: "automatic" });
  });

  it("mengadaptasi ringkasan poin per kelas dan next badge", () => {
    const summary = adaptMyPoints({
      total_points: 120,
      classes: [
        {
          id: 2,
          class_student_id: 4,
          name: "Kelas A",
          total_points: 120,
          last_synced_at: null,
        },
      ],
      next_badge: {
        id: 8,
        name: "Hebat",
        description: null,
        criteria_type: "total_points",
        criteria_value: 200,
      },
    });

    expect(summary).toMatchObject({
      totalPoints: 120,
      classes: [{ classStudentId: 4, totalPoints: 120 }],
      nextBadge: { criteriaValue: 200 },
    });
  });
});
