import { useQuery } from "@tanstack/react-query";
import { getResearchDashboard } from "@/services/modules/superadmin-dashboard.service";
import type { ResearchDashboardFilters } from "@/lib/contracts/superadmin-dashboard";

export function useSuperadminDashboard(filters: ResearchDashboardFilters) {
  return useQuery({ queryKey: ["superadmin-dashboard", filters], queryFn: () => getResearchDashboard(filters), retry: 1 });
}
