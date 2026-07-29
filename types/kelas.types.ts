export interface KelasClass {
  id: number;
  name: string;
  classCode: string;
  studentCount: number;
  createdAt: string;
}

export interface CreateClassInput {
  name: string;
}

export interface UpdateClassInput {
  name: string;
}

export interface ImportFailure {
  row: number;
  errors: string[];
}

export interface ImportStudentsResult {
  imported: number;
  failures: ImportFailure[];
}

export type GradeExportFormat = "csv" | "xlsx";

export interface GradeExportOptions {
  format: GradeExportFormat;
  topicId?: number;
}

export interface DownloadedGradeExport {
  blob: Blob;
  filename: string;
}

export interface ClassStudent {
  id: number;
  studentId: number;
  anonymousId: string;
  name: string;
  nis: string;
  isClaimed: boolean;
  joinedAt: string | null;
}

export interface AddStudentInput {
  name: string;
  nis: string;
}

export interface UpdateStudentInput {
  name: string;
  nis: string;
}
