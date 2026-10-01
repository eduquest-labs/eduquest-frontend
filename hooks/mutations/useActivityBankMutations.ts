import { useMutation, useQueryClient } from "@tanstack/react-query";
import { runBankCommand } from "@/services/modules";
import { bankKeys } from "@/hooks/queries/useActivityBank";
import { authoringKeys } from "@/hooks/queries/useAuthoring";
export function useBankMutation() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: runBankCommand, onSuccess: async () => {
    await Promise.all([queryClient.invalidateQueries({ queryKey: bankKeys.all }), queryClient.invalidateQueries({ queryKey: authoringKeys.all })]);
  } });
}
