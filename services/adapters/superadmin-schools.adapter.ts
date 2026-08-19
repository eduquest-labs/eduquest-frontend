import type { SchoolWithStatsContract } from "@/lib/contracts/superadmin-schools";
import type { SchoolWithStats } from "@/types";

export function adaptSchoolWithStats(contract: SchoolWithStatsContract): SchoolWithStats {
  return {
    id: contract.school_id,
    name: contract.school_name,
    guruCount: contract.guru_count,
    classCount: contract.class_count,
    studentCount: contract.student_count,
  };
}
