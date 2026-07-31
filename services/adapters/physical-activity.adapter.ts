import type {
  PhysicalActivityContract,
  PhysicalActivityRouteContract,
} from "@/lib/contracts/physical-activity";
import type {
  PhysicalActivity,
  PhysicalActivityRoute,
} from "@/types";

export function adaptPhysicalActivity(contract: PhysicalActivityContract): PhysicalActivity {
  return {
    id: contract.id,
    challenge: contract.challenge,
    student: {
      anonymousId: contract.student.anonymous_id,
    },
    startTime: contract.start_time,
    endTime: contract.end_time,
    distanceMeters: Number(contract.distance_meters),
    durationSeconds: contract.duration_seconds,
    averageSpeedKmh:
      contract.avg_speed_kmh === null ? null : Number(contract.avg_speed_kmh),
    status: contract.status,
    gpsPointsCount: contract.gps_points_count,
    acceptedPointsCount: contract.accepted_points_count,
    createdAt: contract.created_at,
  };
}

export function adaptPhysicalActivityRoute(
  contract: PhysicalActivityRouteContract
): PhysicalActivityRoute {
  return {
    points: contract.data.map((point) => ({
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      recordedAt: point.recorded_at,
    })),
    totalPointCount: contract.total_point_count,
    isSampled: contract.is_sampled,
  };
}
