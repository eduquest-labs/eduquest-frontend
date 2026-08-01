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
export type GradeExportIdentity = "anonymous" | "named";

export interface GradeExportOptions {
  format: GradeExportFormat;
  identity?: GradeExportIdentity;
  topicId?: number;
}

export interface DownloadedGradeExport {
  blob: Blob;
  filename: string;
}

export interface ClassStudent {
  id: number;
  studentId: number;
  name: string;
  nisn: string;
  isClaimed: boolean;
  joinedAt: string | null;
}

export interface AddStudentInput {
  name: string;
  nisn: string;
}

export interface UpdateStudentInput {
  name: string;
  nisn: string;
}
