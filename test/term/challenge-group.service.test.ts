import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createChallengeGroup, gradeChallengeGroup, listChallengeGroups } from "@/services/modules";
import { server } from "@/test/msw/server";
import { clearToken, setToken } from "@/services/token-store";

describe("challenge-group service", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("lists groups for a challenge", async () => {
    server.use(
      http.get("*/challenges/1/groups", () =>
        HttpResponse.json({
          data: [{ id: 1, challenge_id: 1, name: "Kelompok A", group_score: null, graded_at: null, members: [] }],
        })
      )
    );

    const result = await listChallengeGroups(1);
    expect(result[0].name).toBe("Kelompok A");
  });

  it("creates a group", async () => {
    server.use(
      http.post("*/challenges/1/groups", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Kelompok B", class_student_ids: [3, 4] });
        return HttpResponse.json(
          { id: 2, challenge_id: 1, name: "Kelompok B", group_score: null, graded_at: null, members: [] },
          { status: 201 }
        );
      })
    );

    const result = await createChallengeGroup(1, { name: "Kelompok B", classStudentIds: [3, 4] });
    expect(result.id).toBe(2);
  });

  it("grades a group", async () => {
    server.use(
      http.patch("*/challenge-groups/2/grade", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ group_score: 85 });
        return HttpResponse.json({
          id: 2,
          challenge_id: 1,
          name: "Kelompok B",
          group_score: "85.00",
          graded_at: "2026-08-22T10:00:00+07:00",
          members: [],
        });
      })
    );

    const result = await gradeChallengeGroup(2, 85);
    expect(result.groupScore).toBe(85);
  });
});
