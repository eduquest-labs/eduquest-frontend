import { useMutation, useQueryClient } from "@tanstack/react-query";

import { termKeys } from "@/hooks/queries";
import { createTerm, overrideTermProgress, updateTerm } from "@/services/modules";
import type { TermInput, TermProgressStatus } from "@/types";

export function useCreateTerm(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TermInput) => createTerm(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: termKeys.list(classId) });
    },
  });
}

export function useUpdateTerm(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ termId, input }: { termId: number; input: Partial<TermInput> }) => updateTerm(termId, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: termKeys.list(classId) });
      queryClient.invalidateQueries({ queryKey: termKeys.thresholdHistory(variables.termId) });
    },
  });
}

export function useOverrideTermProgress(termId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      classStudentId,
      status,
      feedback,
    }: {
      classStudentId: number;
      status: TermProgressStatus | null;
      feedback?: string;
    }) => overrideTermProgress(termId, classStudentId, status, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: termKeys.progress(termId) });
    },
  });
}
