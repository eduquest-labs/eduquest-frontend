import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { ResearchDashboardFilters, ResearchDashboardSnapshot } from "@/lib/contracts/superadmin-dashboard";

export async function getResearchDashboard(filters: ResearchDashboardFilters): Promise<ResearchDashboardSnapshot> {
  const response = await client.get<{ data: ResearchDashboardSnapshot }>(API_ENDPOINTS.SUPERADMIN.DASHBOARD, { params: filters });
  return response.data.data;
}
