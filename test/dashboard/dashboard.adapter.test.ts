import { describe, expect, it } from "vitest";

import { adaptDosenDashboard } from "@/services/adapters";

describe("dashboard adapter", () => {
  it("mengubah response dashboard snake_case menjadi camelCase", () => {
    expect(
      adaptDosenDashboard({
        total_students: 12,
        active_challenges: 3,
        average_score: 82.5,
        recent_activity: [
          {
            id: 9,
            student_name: "Alya",
            challenge_title: "Sprint 100 Meter",
            class_id: 2,
            class_name: "Kelas A",
            started_at: "2026-07-23T10:00:00+07:00",
            is_locked: true,
            total_score: 90,
          },
        ],
      })
    ).toEqual({
      totalStudents: 12,
      activeChallenges: 3,
      averageScore: 82.5,
      recentActivity: [
        {
          id: 9,
          studentName: "Alya",
          challengeTitle: "Sprint 100 Meter",
          classId: 2,
          className: "Kelas A",
          startedAt: "2026-07-23T10:00:00+07:00",
          isLocked: true,
          totalScore: 90,
        },
      ],
    });
  });
});
