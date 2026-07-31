import { useMutation, useQueryClient } from "@tanstack/react-query";

import { physicalActivityKeys } from "@/hooks/queries/usePhysicalActivity";
import {
  finishPhysicalActivity,
  startPhysicalActivity,
  uploadPhysicalActivityPoints,
} from "@/services/modules";
import type { GpsPointInput } from "@/types";

export function useStartPhysicalActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startPhysicalActivity,
    onSuccess: (activity) => {
      queryClient.setQueryData(physicalActivityKeys.detail(activity.id), activity);
    },
  });
}

export function useUploadPhysicalActivityPoints() {
  return useMutation({
    mutationFn: ({
      activityId,
      points,
    }: {
      activityId: number;
      points: GpsPointInput[];
    }) => uploadPhysicalActivityPoints(activityId, points),
  });
}

export function useFinishPhysicalActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: finishPhysicalActivity,
    onSuccess: (activity) => {
      queryClient.setQueryData(physicalActivityKeys.detail(activity.id), activity);
      void queryClient.invalidateQueries({
        queryKey: physicalActivityKeys.route(activity.id),
      });
    },
  });
}
