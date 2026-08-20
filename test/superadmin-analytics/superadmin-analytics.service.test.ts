import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";
import { listSchoolComparison } from "@/services/modules";
import { clearToken, setToken } from "@/services/token-store";

describe("superadmin-analytics service", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("fetches and adapts the schools comparison list", async () => {
    server.use(
      http.get("*/superadmin/analytics/schools-comparison", () =>
        HttpResponse.json({
          data: [
            {
              school_id: 1,
              school_name: "SMA Negeri 1 Bandung",
              student_count: 18,
              locked_attempt_count: 24,
              scored_attempt_count: 20,
              average_score: 78.25,
              minimum_score: 40,
              maximum_score: 100,
              median_score: 80,
            },
          ],
        })
      )
    );

    await expect(listSchoolComparison()).resolves.toEqual([
      {
        schoolId: 1,
        schoolName: "SMA Negeri 1 Bandung",
        studentCount: 18,
        lockedAttemptCount: 24,
        scoredAttemptCount: 20,
        averageScore: 78.25,
        minimumScore: 40,
        maximumScore: 100,
        medianScore: 80,
      },
    ]);
  });
});
