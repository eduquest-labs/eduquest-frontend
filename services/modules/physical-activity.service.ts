import type {
  GpsPointAcknowledgementContract,
  GpsPointInputContract,
  PhysicalActivityResponseContract,
  PhysicalActivityRouteContract,
} from "@/lib/contracts/physical-activity";
import {
  adaptPhysicalActivity,
  adaptPhysicalActivityRoute,
} from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type {
  GpsPointAcknowledgement,
  GpsPointInput,
  PhysicalActivity,
  PhysicalActivityRoute,
} from "@/types";

export async function startPhysicalActivity(challengeId: number): Promise<PhysicalActivity> {
  const { data } = await client.post<PhysicalActivityResponseContract>(
    API_ENDPOINTS.PHYSICAL_ACTIVITIES.START,
    { challenge_id: challengeId }
  );

  return adaptPhysicalActivity(data.data);
}

export async function getPhysicalActivity(activityId: number): Promise<PhysicalActivity> {
  const { data } = await client.get<PhysicalActivityResponseContract>(
    API_ENDPOINTS.PHYSICAL_ACTIVITIES.DETAIL(activityId)
  );

  return adaptPhysicalActivity(data.data);
}

export async function uploadPhysicalActivityPoints(
  activityId: number,
  points: GpsPointInput[]
): Promise<GpsPointAcknowledgement> {
  const payload: GpsPointInputContract[] = points.map((point) => ({
    client_point_id: point.clientPointId,
    latitude: point.latitude,
    longitude: point.longitude,
    accuracy_meters: point.accuracyMeters,
    recorded_at: point.recordedAt,
  }));
  const { data } = await client.post<GpsPointAcknowledgementContract>(
    API_ENDPOINTS.PHYSICAL_ACTIVITIES.POINTS(activityId),
    { points: payload }
  );

  return {
    acknowledgedClientPointIds: data.acknowledged_client_point_ids,
  };
}

export async function finishPhysicalActivity(activityId: number): Promise<PhysicalActivity> {
  const { data } = await client.post<PhysicalActivityResponseContract>(
    API_ENDPOINTS.PHYSICAL_ACTIVITIES.FINISH(activityId)
  );

  return adaptPhysicalActivity(data.data);
}

export async function getPhysicalActivityRoute(
  activityId: number
): Promise<PhysicalActivityRoute> {
  const { data } = await client.get<PhysicalActivityRouteContract>(
    API_ENDPOINTS.PHYSICAL_ACTIVITIES.ROUTE(activityId)
  );

  return adaptPhysicalActivityRoute(data);
}
