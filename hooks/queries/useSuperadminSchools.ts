import { useQuery } from "@tanstack/react-query";

import { listSchoolsWithStats } from "@/services/modules";

export const superadminSchoolKeys = {
  all: ["superadmin-schools"] as const,
  list: () => [...superadminSchoolKeys.all, "list"] as const,
};

export function useSuperadminSchools() {
  return useQuery({
    queryKey: superadminSchoolKeys.list(),
    queryFn: listSchoolsWithStats,
  });
}
