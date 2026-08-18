import type { SchoolContract } from "@/lib/contracts/schools";
import type { School } from "@/types";

export function adaptSchool(contract: SchoolContract): School {
  return { id: contract.id, name: contract.name };
}
