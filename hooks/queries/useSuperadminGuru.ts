import { useQuery } from "@tanstack/react-query";

import { listGuruWithStats } from "@/services/modules";

export const superadminGuruKeys = {
  all: ["superadmin-guru"] as const,
  list: (schoolId?: number) => [...superadminGuruKeys.all, "list", schoolId ?? "all"] as const,
};

export function useSuperadminGuru(schoolId?: number) {
  return useQuery({
    queryKey: superadminGuruKeys.list(schoolId),
    queryFn: () => listGuruWithStats(schoolId),
  });
}
