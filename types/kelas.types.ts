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

export interface ImportFailure {
  row: number;
  errors: string[];
}

export interface ImportStudentsResult {
  imported: number;
  failures: ImportFailure[];
}

export interface ClassStudent {
  id: number;
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
