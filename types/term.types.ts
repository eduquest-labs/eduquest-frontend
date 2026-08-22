export type TermProgressStatus = "in_progress" | "passed" | "failed";
export type TermProgressSource = "auto" | "override";

export interface Term {
  id: number;
  classId: number;
  name: string;
  sortOrder: number;
  thresholdPercent: number;
  releaseAt: string | null;
  randomizeQuestions: boolean;
}

export interface TermInput {
  name: string;
  sortOrder: number;
  thresholdPercent: number;
  releaseAt: string | null;
  randomizeQuestions: boolean;
}

export interface TermThresholdHistoryEntry {
  oldThreshold: number | null;
  newThreshold: number;
  changedBy: number;
  createdAt: string;
}

export interface StudentTermProgressEntry {
  classStudentId: number;
  studentName: string;
  status: TermProgressStatus;
  source: TermProgressSource;
  feedback: string | null;
}

export interface StudentOwnTermProgress {
  termId: number;
  termName: string;
  sortOrder: number;
  status: TermProgressStatus;
  source: TermProgressSource;
}
