import type { MonitoringResponseContract } from "@/lib/contracts/monitoring";
import { adaptMonitoringActivity } from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { MonitoringActivity } from "@/types";

export async function getMonitoring(
  classId: number | null
): Promise<MonitoringActivity[]> {
  const { data } = await client.get<MonitoringResponseContract>(
    API_ENDPOINTS.MONITORING.DOSEN,
    {
      params: classId === null ? undefined : { class_id: classId },
    }
  );

  return data.data.map(adaptMonitoringActivity);
}
