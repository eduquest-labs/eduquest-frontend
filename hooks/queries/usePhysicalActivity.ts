import { useQuery } from "@tanstack/react-query";

import {
  getPhysicalActivity,
  getPhysicalActivityRoute,
} from "@/services/modules";

export const physicalActivityKeys = {
  all: ["physical-activities"] as const,
  detail: (activityId: number) =>
    [...physicalActivityKeys.all, "detail", activityId] as const,
  route: (activityId: number) =>
    [...physicalActivityKeys.all, "route", activityId] as const,
};

export function usePhysicalActivity(activityId: number, enabled = true) {
  return useQuery({
    queryKey: physicalActivityKeys.detail(activityId),
    queryFn: () => getPhysicalActivity(activityId),
    enabled: enabled && Number.isFinite(activityId) && activityId > 0,
  });
}

export function usePhysicalActivityRoute(activityId: number, enabled = true) {
  return useQuery({
    queryKey: physicalActivityKeys.route(activityId),
    queryFn: () => getPhysicalActivityRoute(activityId),
    enabled: enabled && Number.isFinite(activityId) && activityId > 0,
  });
}
