import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptSchoolComparison } from "@/services/adapters";
import type { SchoolComparisonResponseContract } from "@/lib/contracts/superadmin-analytics";
import type { SchoolComparison } from "@/types";

export async function listSchoolComparison(): Promise<SchoolComparison[]> {
  const { data } = await client.get<SchoolComparisonResponseContract>(
    API_ENDPOINTS.SUPERADMIN.SCHOOLS_COMPARISON
  );

  return data.data.map(adaptSchoolComparison);
}
