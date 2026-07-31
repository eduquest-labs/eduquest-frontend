import { describe, expect, it } from "vitest";

import {
  adaptPhysicalActivity,
  adaptPhysicalActivityRoute,
} from "@/services/adapters";

describe("physical activity adapters", () => {
  it("mengubah resource decimal dan snake_case ke domain type", () => {
    const activity = adaptPhysicalActivity({
      id: 7,
      challenge: { id: 3, title: "Lari pagi", type: "aktivitas_fisik" },
      student: { anonymous_id: "STU-001" },
      start_time: "2026-07-31T08:00:00+07:00",
      end_time: null,
      distance_meters: "1234.50",
      duration_seconds: 300,
      avg_speed_kmh: "14.81",
      status: "recording",
      gps_points_count: 12,
      accepted_points_count: 10,
      created_at: "2026-07-31T08:00:00+07:00",
    });

    expect(activity).toMatchObject({
      id: 7,
      student: { anonymousId: "STU-001" },
      distanceMeters: 1234.5,
      averageSpeedKmh: 14.81,
      gpsPointsCount: 12,
      acceptedPointsCount: 10,
    });
  });

  it("mengadaptasi sampled route menjadi koordinat numerik", () => {
    expect(adaptPhysicalActivityRoute({
      data: [{
        latitude: "-6.2000000",
        longitude: "106.8000000",
        recorded_at: "2026-07-31T08:00:00+07:00",
      }],
      total_point_count: 2500,
      is_sampled: true,
    })).toEqual({
      points: [{
        latitude: -6.2,
        longitude: 106.8,
        recordedAt: "2026-07-31T08:00:00+07:00",
      }],
      totalPointCount: 2500,
      isSampled: true,
    });
  });
});
