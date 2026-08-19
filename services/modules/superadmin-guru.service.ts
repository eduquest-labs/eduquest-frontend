import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptGuruAnalytics, adaptGuruListItem } from "@/services/adapters";
import type {
  GuruAnalyticsResponseContract,
  GuruListResponseContract,
} from "@/lib/contracts/superadmin-guru";
import type { GuruWithStats } from "@/types";

export async function listGuruWithStats(schoolId?: number): Promise<GuruWithStats[]> {
  const params = schoolId ? { school_id: schoolId } : undefined;

  const [listResponse, analyticsResponse] = await Promise.all([
    client.get<GuruListResponseContract>(API_ENDPOINTS.SUPERADMIN.GURU_LIST, { params }),
    client.get<GuruAnalyticsResponseContract>(API_ENDPOINTS.SUPERADMIN.GURU_ANALYTICS, { params }),
  ]);

  const analyticsById = new Map(
    analyticsResponse.data.data.map((item) => [item.guru_id, adaptGuruAnalytics(item)])
  );

  return listResponse.data.data.map((item) => {
    const base = adaptGuruListItem(item);
    const stats = analyticsById.get(item.id);

    return {
      ...base,
      schoolName: stats?.schoolName ?? null,
      classCount: stats?.classCount ?? 0,
      studentCount: stats?.studentCount ?? 0,
    };
  });
}

export async function updateGuru(
  id: number,
  input: { name: string; email: string; schoolId: number }
): Promise<void> {
  await client.patch(API_ENDPOINTS.SUPERADMIN.GURU_UPDATE(id), {
    name: input.name,
    email: input.email,
    school_id: input.schoolId,
  });
}

export async function deactivateGuru(id: number): Promise<void> {
  await client.delete(API_ENDPOINTS.SUPERADMIN.GURU_DEACTIVATE(id));
}

export async function reactivateGuru(id: number, password: string): Promise<void> {
  await client.patch(API_ENDPOINTS.SUPERADMIN.GURU_REACTIVATE(id), {
    password,
    password_confirmation: password,
  });
}
