import type { GuruDashboardContract } from "@/lib/contracts/dashboard";
import { adaptGuruDashboard } from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { GuruDashboard } from "@/types";

export async function getGuruDashboard(
  classId: number | null
): Promise<GuruDashboard> {
  const { data } = await client.get<GuruDashboardContract>(
    API_ENDPOINTS.DASHBOARD.DOSEN,
    {
      params: classId === null ? undefined : { class_id: classId },
    }
  );

  return adaptGuruDashboard(data);
}
