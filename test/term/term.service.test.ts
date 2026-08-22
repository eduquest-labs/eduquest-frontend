import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createTerm,
  getMyTerms,
  getTermProgress,
  getThresholdHistory,
  listTerms,
  overrideTermProgress,
  updateTerm,
} from "@/services/modules";
import { server } from "@/test/msw/server";
import { clearToken, setToken } from "@/services/token-store";

describe("term service", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("lists terms for a class", async () => {
    server.use(
      http.get("*/classes/1/terms", () =>
        HttpResponse.json({
          data: [
            {
              id: 1,
              class_id: 1,
              name: "Termin 1",
              sort_order: 0,
              threshold_percent: "60.00",
              release_at: null,
              randomize_questions: false,
            },
          ],
        })
      )
    );

    await expect(listTerms(1)).resolves.toEqual([
      {
        id: 1,
        classId: 1,
        name: "Termin 1",
        sortOrder: 0,
        thresholdPercent: 60,
        releaseAt: null,
        randomizeQuestions: false,
      },
    ]);
  });

  it("creates a term", async () => {
    server.use(
      http.post("*/classes/1/terms", () =>
        HttpResponse.json(
          {
            id: 2,
            class_id: 1,
            name: "Termin 2",
            sort_order: 1,
            threshold_percent: "70.00",
            release_at: null,
            randomize_questions: false,
          },
          { status: 201 }
        )
      )
    );

    const result = await createTerm(1, {
      name: "Termin 2",
      sortOrder: 1,
      thresholdPercent: 70,
      releaseAt: null,
      randomizeQuestions: false,
    });

    expect(result.name).toBe("Termin 2");
  });

  it("updates a term", async () => {
    server.use(
      http.patch("*/terms/1", () =>
        HttpResponse.json({
          id: 1,
          class_id: 1,
          name: "Termin 1",
          sort_order: 0,
          threshold_percent: "75.00",
          release_at: null,
          randomize_questions: false,
        })
      )
    );

    const result = await updateTerm(1, { thresholdPercent: 75 });

    expect(result.thresholdPercent).toBe(75);
  });

  it("gets threshold history", async () => {
    server.use(
      http.get("*/terms/1/threshold-history", () =>
        HttpResponse.json({
          data: [{ old_threshold: null, new_threshold: "60.00", changed_by: 5, created_at: "2026-08-22T10:00:00+07:00" }],
        })
      )
    );

    const result = await getThresholdHistory(1);

    expect(result).toHaveLength(1);
    expect(result[0].newThreshold).toBe(60);
  });

  it("gets term progress list", async () => {
    server.use(
      http.get("*/terms/1/progress", () =>
        HttpResponse.json({
          data: [{ class_student_id: 3, student_name: "Budi", status: "passed", source: "auto", feedback: null }],
        })
      )
    );

    const result = await getTermProgress(1);

    expect(result[0].studentName).toBe("Budi");
  });

  it("overrides term progress", async () => {
    server.use(
      http.patch("*/terms/1/students/3/override", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ status: "passed", feedback: "Kerja bagus" });
        return HttpResponse.json({ message: "ok" });
      })
    );

    await expect(overrideTermProgress(1, 3, "passed", "Kerja bagus")).resolves.toBeUndefined();
  });

  it("gets the student's own term list", async () => {
    server.use(
      http.get("*/students/me/terms", () =>
        HttpResponse.json({
          data: [{ term_id: 1, term_name: "Termin 1", sort_order: 0, status: "in_progress", source: "auto" }],
        })
      )
    );

    const result = await getMyTerms();

    expect(result[0].termName).toBe("Termin 1");
  });
});
