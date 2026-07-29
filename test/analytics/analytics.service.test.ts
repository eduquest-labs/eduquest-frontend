import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getClassComparison } from "@/services/modules";
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
});
