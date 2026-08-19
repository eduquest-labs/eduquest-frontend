import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptSchoolWithStats } from "@/services/adapters";
import type { SchoolWithStatsResponseContract } from "@/lib/contracts/superadmin-schools";
import type { SchoolWithStats } from "@/types";

export async function listSchoolsWithStats(): Promise<SchoolWithStats[]> {
  const { data } = await client.get<SchoolWithStatsResponseContract>(
    API_ENDPOINTS.SUPERADMIN.SCHOOLS_ANALYTICS
  );
  return data.data.map(adaptSchoolWithStats);
}

export async function createSchool(name: string): Promise<{ id: number; name: string }> {
  const { data } = await client.post<{ id: number; name: string }>(
    API_ENDPOINTS.SCHOOLS.CREATE,
    { name }
  );
  return data;
}

export async function updateSchool(
  id: number,
  name: string
): Promise<{ id: number; name: string }> {
  const { data } = await client.patch<{ id: number; name: string }>(
    API_ENDPOINTS.SCHOOLS.UPDATE(id),
    { name }
  );
  return data;
}

export async function deleteSchool(id: number): Promise<void> {
  await client.delete(API_ENDPOINTS.SCHOOLS.DELETE(id));
}
