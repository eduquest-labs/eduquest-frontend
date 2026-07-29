export interface ClassComparison {
  classId: number;
  className: string;
  studentCount: number;
  lockedAttemptCount: number;
  scoredAttemptCount: number;
  averageScore: number | null;
  minimumScore: number | null;
  maximumScore: number | null;
  medianScore: number | null;
}
