import type { SchoolComparisonContract } from "@/lib/contracts/superadmin-analytics";
import type { SchoolComparison } from "@/types";

export function adaptSchoolComparison(contract: SchoolComparisonContract): SchoolComparison {
  return {
    schoolId: contract.school_id,
    schoolName: contract.school_name,
    studentCount: contract.student_count,
    lockedAttemptCount: contract.locked_attempt_count,
    scoredAttemptCount: contract.scored_attempt_count,
    averageScore: contract.average_score,
    minimumScore: contract.minimum_score,
    maximumScore: contract.maximum_score,
    medianScore: contract.median_score,
  };
}
