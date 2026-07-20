import { describe, expect, it } from "vitest";

import {
  adaptLeaderboard,
  adaptStudentProgress,
} from "@/services/adapters";

describe("leaderboard adapters", () => {
  it("mengadaptasi leaderboard dan metadata topik", () => {
    expect(
      adaptLeaderboard({
        class: { id: 2, name: "Kelas A" },
        topic: { id: 3, name: "Aljabar" },
        topics: [{ id: 3, name: "Aljabar" }],
        data: [
          {
            rank: 1,
            class_student_id: 4,
            student_name: "Alya",
            score: 90,
          },
        ],
      })
    ).toEqual({
      classInfo: { id: 2, name: "Kelas A" },
      topic: { id: 3, name: "Aljabar" },
      topics: [{ id: 3, name: "Aljabar" }],
      entries: [
        {
          rank: 1,
          classStudentId: 4,
          studentName: "Alya",
          score: 90,
        },
      ],
    });
  });

  it("mengadaptasi progress dan hitungan absolut", () => {
    expect(
      adaptStudentProgress({
        class: { id: 2, name: "Kelas A" },
        student: { id: 5, class_student_id: 4, name: "Alya" },
        topic: null,
        completed_challenges: 2,
        total_challenges: 5,
        percentage: 40,
      })
    ).toMatchObject({
      student: { classStudentId: 4 },
      completedChallenges: 2,
      totalChallenges: 5,
      percentage: 40,
    });
  });
});
