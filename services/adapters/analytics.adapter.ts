import type {
  ClassComparisonContract,
  ClassProgressChartPointContract,
  StudentProgressChartPointContract,
} from "@/lib/contracts/analytics";
import type { ClassComparison, ProgressChartPoint } from "@/types";

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

export function adaptClassProgressPoint(
  contract: ClassProgressChartPointContract
): ProgressChartPoint {
  return {
    finishedAt: contract.finished_at,
    score: contract.average_score,
    challengeTitle: contract.challenge_title,
  };
}

export function adaptStudentProgressPoint(
  contract: StudentProgressChartPointContract
): ProgressChartPoint {
  return {
    finishedAt: contract.finished_at,
    score: contract.score,
    challengeTitle: contract.challenge_title,
  };
}
