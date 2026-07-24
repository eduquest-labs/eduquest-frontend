import type { DosenDashboardContract } from "@/lib/contracts/dashboard";
import { adaptDosenDashboard } from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { DosenDashboard } from "@/types";

export async function getDosenDashboard(
  classId: number | null
): Promise<DosenDashboard> {
  const { data } = await client.get<DosenDashboardContract>(
    API_ENDPOINTS.DASHBOARD.DOSEN,
    {
      params: classId === null ? undefined : { class_id: classId },
    }
  );

  return adaptDosenDashboard(data);
}
