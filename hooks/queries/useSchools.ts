import { useQuery } from "@tanstack/react-query";

import { listSchools } from "@/services/modules";

export const schoolKeys = {
  all: ["schools"] as const,
  list: () => [...schoolKeys.all, "list"] as const,
};

export function useSchools() {
  return useQuery({
    queryKey: schoolKeys.list(),
    queryFn: listSchools,
  });
}
