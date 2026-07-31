import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  finishPhysicalActivity,
  getPhysicalActivityRoute,
  startPhysicalActivity,
  uploadPhysicalActivityPoints,
} from "@/services/modules";
import { server } from "@/test/msw/server";

const activityContract = {
  id: 7,
  challenge: { id: 3, title: "Lari pagi", type: "aktivitas_fisik" as const },
  student: { anonymous_id: "STU-001" },
  start_time: "2026-07-31T08:00:00+07:00",
  end_time: null,
  distance_meters: "0.00",
  duration_seconds: 0,
  avg_speed_kmh: null,
  status: "recording" as const,
  gps_points_count: 0,
  accepted_points_count: 0,
  created_at: "2026-07-31T08:00:00+07:00",
};

describe("physical activity services", () => {
  it("memulai activity dan mengadaptasi resource wrapper", async () => {
    server.use(
      http.post("*/physical-activities", async ({ request }) => {
        expect(await request.json()).toEqual({ challenge_id: 3 });
        return HttpResponse.json({ data: activityContract }, { status: 201 });
      })
    );

    await expect(startPhysicalActivity(3)).resolves.toMatchObject({
      id: 7,
      challenge: { title: "Lari pagi" },
      status: "recording",
    });
  });

  it("mengirim batch snake_case dan hanya mengembalikan UUID yang diakui", async () => {
    server.use(
      http.post("*/physical-activities/7/points", async ({ request }) => {
        expect(await request.json()).toEqual({
          points: [{
            client_point_id: "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
            latitude: -6.2,
            longitude: 106.8,
            accuracy_meters: 5,
            recorded_at: "2026-07-31T01:00:00.000Z",
          }],
        });
        return HttpResponse.json({
          acknowledged_client_point_ids: [
            "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
          ],
        });
      })
    );

    await expect(uploadPhysicalActivityPoints(7, [{
      clientPointId: "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
      latitude: -6.2,
      longitude: 106.8,
      accuracyMeters: 5,
      recordedAt: "2026-07-31T01:00:00.000Z",
    }])).resolves.toEqual({
      acknowledgedClientPointIds: [
        "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
      ],
    });
  });

  it("menyelesaikan activity dan memuat sampled route", async () => {
    server.use(
      http.post("*/physical-activities/7/finish", () => HttpResponse.json({
        data: {
          ...activityContract,
          status: "completed",
          end_time: "2026-07-31T08:10:00+07:00",
          distance_meters: "1500.25",
          duration_seconds: 600,
          avg_speed_kmh: "9.00",
        },
      })),
      http.get("*/physical-activities/7/route", () => HttpResponse.json({
        data: [{
          latitude: "-6.2000000",
          longitude: "106.8000000",
          recorded_at: "2026-07-31T08:00:00+07:00",
        }],
        total_point_count: 1,
        is_sampled: false,
      }))
    );

    await expect(finishPhysicalActivity(7)).resolves.toMatchObject({
      status: "completed",
      distanceMeters: 1500.25,
    });
    await expect(getPhysicalActivityRoute(7)).resolves.toMatchObject({
      totalPointCount: 1,
      points: [{ latitude: -6.2, longitude: 106.8 }],
    });
  });
});
