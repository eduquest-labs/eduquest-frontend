import type { ClassComparisonContract } from "@/lib/contracts/analytics";
import type { ClassComparison } from "@/types";

export function adaptClassComparison(
  contract: ClassComparisonContract
): ClassComparison {
  return {
    classId: contract.class_id,
    className: contract.class_name,
    studentCount: contract.student_count,
    lockedAttemptCount: contract.locked_attempt_count,
    scoredAttemptCount: contract.scored_attempt_count,
    averageScore: contract.average_score,
    minimumScore: contract.minimum_score,
    maximumScore: contract.maximum_score,
    medianScore: contract.median_score,
  };
}
