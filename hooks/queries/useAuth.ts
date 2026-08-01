import { useQuery } from "@tanstack/react-query";

import { getMe } from "@/services/modules";

export const authKeys = { me: ["auth", "me"] as const };

export function useMe() {
  return useQuery({ queryKey: authKeys.me, queryFn: getMe, staleTime: 30_000 });
}
