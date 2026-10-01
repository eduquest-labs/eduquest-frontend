import { useMutation, useQueryClient } from "@tanstack/react-query";

import { superadminGuruKeys } from "@/hooks/queries";
import { deactivateGuru, reactivateGuru, updateGuru } from "@/services/modules";

export function useUpdateGuru() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: number; name: string; email: string; schoolId: number }) =>
      updateGuru(input.id, { name: input.name, email: input.email, schoolId: input.schoolId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminGuruKeys.all });
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-schools"] });
    },
  });
}

export function useDeactivateGuru() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateGuru(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminGuruKeys.all });
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-schools"] });
    },
  });
}

export function useReactivateGuru() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => reactivateGuru(id, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: superadminGuruKeys.all });
      queryClient.invalidateQueries({ queryKey: ["superadmin-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["superadmin-schools"] });
    },
  });
}
