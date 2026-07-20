import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  awardStudentBadge,
  createPointAdjustment,
  getMyPoints,
  getStudentPoints,
} from "@/services/modules";
import { server } from "@/test/msw/server";

const badge = {
  id: 1,
  name: "Pemburu Poin",
  description: null,
  criteria_type: "total_points" as const,
  criteria_value: 100,
};

describe("points service", () => {
  it("memuat detail poin melalui nested endpoint", async () => {
    server.use(
      http.get("*/classes/2/students/4/points", () =>
        HttpResponse.json({
          class: { id: 2, name: "Kelas A" },
          student: { id: 3, class_student_id: 4, name: "Budi" },
          total_points: 80,
          last_synced_at: "2026-07-20T08:00:00+07:00",
          adjustments: [],
          badges: [],
        })
      )
    );

    await expect(getStudentPoints(2, 4)).resolves.toMatchObject({
      totalPoints: 80,
      student: { classStudentId: 4 },
    });
  });

  it("mengirim adjustment signed dan reason", async () => {
    server.use(
      http.post("*/classes/2/students/4/point-adjustments", async ({ request }) => {
        expect(await request.json()).toEqual({ points: -10, reason: "Koreksi" });
        return HttpResponse.json(
          {
            adjustment: {
              id: 5,
              points: -10,
              reason: "Koreksi",
              adjusted_by: { id: 6, name: "Dosen" },
              created_at: "2026-07-20T08:00:00+07:00",
            },
            points: {
              total_points: 70,
              last_synced_at: "2026-07-20T08:00:00+07:00",
            },
          },
          { status: 201 }
        );
      })
    );

    await expect(
      createPointAdjustment(2, 4, { points: -10, reason: "Koreksi" })
    ).resolves.toMatchObject({ totalPoints: 70, adjustment: { points: -10 } });
  });

  it("memuat own points dan memberi badge manual", async () => {
    server.use(
      http.get("*/students/me/points", () =>
        HttpResponse.json({
          total_points: 80,
          level: {
            level: 3,
            current_level_points: 0,
            points_to_next_level: 100,
            progress_percentage: 0,
          },
          classes: [
            {
              id: 2,
              class_student_id: 4,
              name: "Kelas A",
              total_points: 80,
              last_synced_at: null,
            },
          ],
          next_badge: badge,
        })
      ),
      http.post("*/classes/2/students/4/badges/1", () =>
        HttpResponse.json(
          {
            id: 7,
            badge,
            awarded_at: "2026-07-20T08:00:00+07:00",
            awarded_by: { id: 6, name: "Dosen" },
            award_source: "manual",
          },
          { status: 201 }
        )
      )
    );

    await expect(getMyPoints()).resolves.toMatchObject({ nextBadge: { id: 1 } });
    await expect(awardStudentBadge(2, 4, 1)).resolves.toMatchObject({
      awardSource: "manual",
    });
  });
});
