import { describe, expect, it } from "vitest";

import { adaptMonitoringActivity } from "@/services/adapters";

describe("monitoring adapter", () => {
  it("mengubah contract snake_case menjadi activity camelCase", () => {
    expect(
      adaptMonitoringActivity({
        id: 12,
        student_name: "Alya",
        challenge_title: "Kuis Pecahan",
        class_id: 3,
        class_name: "Kelas A",
        started_at: "2026-07-26T09:55:00+07:00",
        finished_at: null,
        status: "in_progress",
        total_score: null,
      })
    ).toEqual({
      id: 12,
      studentName: "Alya",
      challengeTitle: "Kuis Pecahan",
      classId: 3,
      className: "Kelas A",
      startedAt: "2026-07-26T09:55:00+07:00",
      finishedAt: null,
      status: "in_progress",
      totalScore: null,
    });
  });

  it("mempertahankan waktu submit dan skor attempt terkunci", () => {
    const activity = adaptMonitoringActivity({
      id: 13,
      student_name: "Bima",
      challenge_title: "Sprint",
      class_id: 4,
      class_name: "Kelas B",
      started_at: "2026-07-26T09:50:00+07:00",
      finished_at: "2026-07-26T09:59:00+07:00",
      status: "just_submitted",
      total_score: 90,
    });

    expect(activity).toMatchObject({
      status: "just_submitted",
      finishedAt: "2026-07-26T09:59:00+07:00",
      totalScore: 90,
    });
  });
});
