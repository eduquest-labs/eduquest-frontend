import type { GuruAnalyticsContract, GuruListItemContract } from "@/lib/contracts/superadmin-guru";
import type { GuruWithStats } from "@/types";

export function adaptGuruListItem(
  contract: GuruListItemContract
): Pick<GuruWithStats, "id" | "name" | "email" | "schoolId" | "isActive"> {
  return {
    id: contract.id,
    name: contract.name,
    email: contract.email,
    schoolId: contract.school_id,
    isActive: contract.is_active,
  };
}

export function adaptGuruAnalytics(
  contract: GuruAnalyticsContract
): Pick<GuruWithStats, "schoolName" | "classCount" | "studentCount"> {
  return {
    schoolName: contract.school_name,
    classCount: contract.class_count,
    studentCount: contract.student_count,
  };
}
