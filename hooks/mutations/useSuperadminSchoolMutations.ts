import { useMutation, useQueryClient } from "@tanstack/react-query";

import { superadminSchoolKeys } from "@/hooks/queries";
import { createSchool, deleteSchool, updateSchool } from "@/services/modules";

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSchool(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminSchoolKeys.all });
    },
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateSchool(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminSchoolKeys.all });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSchool(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminSchoolKeys.all });
    },
  });
}
