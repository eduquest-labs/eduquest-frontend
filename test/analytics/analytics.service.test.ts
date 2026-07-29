import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getClassComparison, getProgressChart } from "@/services/modules";
import { server } from "@/test/msw/server";

describe("analytics service", () => {
  it("mengambil snapshot class comparison dari endpoint analytics", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/dosen/class-comparison", () =>
        HttpResponse.json({
          data: [
            {
              class_id: 2,
              class_name: "Sekolah A",
              student_count: 15,
              locked_attempt_count: 12,
              scored_attempt_count: 10,
              average_score: 82.5,
              minimum_score: 60,
              maximum_score: 100,
              median_score: 85,
            },
          ],
        })
      )
    );

    await expect(getClassComparison()).resolves.toEqual([
      {
        classId: 2,
        className: "Sekolah A",
        studentCount: 15,
        lockedAttemptCount: 12,
        scoredAttemptCount: 10,
        averageScore: 82.5,
        minimumScore: 60,
        maximumScore: 100,
        medianScore: 85,
      },
    ]);
  });

  it("mengambil progres kelas dan meneruskan filter siswa opsional", async () => {
    const requestedStudentIds: Array<string | null> = [];
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/classes/2/progress-chart", ({ request }) => {
        const studentId = new URL(request.url).searchParams.get("student_id");
        requestedStudentIds.push(studentId);

        return studentId === null
          ? HttpResponse.json({
              data: [
                {
                  finished_at: "2026-07-01T08:00:00+07:00",
                  average_score: 75.5,
                  challenge_title: "Pre-test",
                },
              ],
            })
          : HttpResponse.json({
              data: [
                {
                  finished_at: "2026-07-02T08:00:00+07:00",
                  score: 88,
                  challenge_title: "Pre-test",
                },
              ],
            });
      })
    );

    await expect(getProgressChart(2)).resolves.toEqual({
      mode: "class",
      points: [
        {
          finishedAt: "2026-07-01T08:00:00+07:00",
          score: 75.5,
          challengeTitle: "Pre-test",
        },
      ],
    });
    await expect(getProgressChart(2, 7)).resolves.toEqual({
      mode: "student",
      points: [
        {
          finishedAt: "2026-07-02T08:00:00+07:00",
          score: 88,
          challengeTitle: "Pre-test",
        },
      ],
    });
    expect(requestedStudentIds).toEqual([null, "7"]);
  });
});
