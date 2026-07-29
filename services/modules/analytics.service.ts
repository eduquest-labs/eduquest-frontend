import type { ClassComparisonResponseContract } from "@/lib/contracts/analytics";
import { adaptClassComparison } from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { ClassComparison } from "@/types";

export async function getClassComparison(): Promise<ClassComparison[]> {
  const { data } = await client.get<ClassComparisonResponseContract>(
    API_ENDPOINTS.ANALYTICS.CLASS_COMPARISON
  );

  return data.data.map(adaptClassComparison);
}
