export interface SchoolComparison {
  schoolId: number;
  schoolName: string;
  studentCount: number;
  lockedAttemptCount: number;
  scoredAttemptCount: number;
  averageScore: number | null;
  minimumScore: number | null;
  maximumScore: number | null;
  medianScore: number | null;
}
