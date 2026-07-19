import { useMutation, useQueryClient } from "@tanstack/react-query";

import { pointsKeys } from "@/hooks/queries";
import { awardStudentBadge, createPointAdjustment } from "@/services/modules";
import type { PointAdjustmentInput } from "@/types";

export function useCreatePointAdjustment(classId: number, classStudentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PointAdjustmentInput) =>
      createPointAdjustment(classId, classStudentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pointsKeys.student(classId, classStudentId),
      });
    },
  });
}

export function useAwardStudentBadge(classId: number, classStudentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) =>
      awardStudentBadge(classId, classStudentId, badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: pointsKeys.student(classId, classStudentId),
      });
    },
  });
}
