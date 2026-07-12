import { useMutation, useQueryClient } from "@tanstack/react-query";

import { kelasKeys } from "@/hooks/queries";
import { createClass, importStudents } from "@/services/modules";
import type { CreateClassInput } from "@/types";

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => createClass(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.lists() });
    },
  });
}

export function useImportStudents(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importStudents(classId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: kelasKeys.students(classId) });
    },
  });
}
