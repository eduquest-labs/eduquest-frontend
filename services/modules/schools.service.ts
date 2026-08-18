import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptSchool } from "@/services/adapters";
import type { SchoolListResponseContract } from "@/lib/contracts/schools";
import type { School } from "@/types";

export async function listSchools(): Promise<School[]> {
  const { data } = await client.get<SchoolListResponseContract>(API_ENDPOINTS.SCHOOLS.LIST);
  return data.data.map(adaptSchool);
}
