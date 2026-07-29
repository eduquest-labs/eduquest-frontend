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

export type ProgressChartMode = "class" | "student";

export interface ProgressChartPoint {
  finishedAt: string;
  score: number;
  challengeTitle: string;
}

export interface ProgressChartData {
  mode: ProgressChartMode;
  points: ProgressChartPoint[];
}
