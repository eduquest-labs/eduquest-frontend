export interface ClassListItemContract {
  id: number;
  name: string;
  class_code: string;
  student_count: number;
  created_at: string;
}

export interface ClassListResponseContract {
  data: ClassListItemContract[];
}

export interface ClassDetailContract {
  id: number;
  name: string;
  class_code: string;
  student_count: number;
  created_at: string;
}

export interface CreateClassResponseContract {
  id: number;
  name: string;
  class_code: string;
  created_at: string;
}

export interface ImportStudentsResponseContract {
  imported: number;
  failures: { row: number; errors: string[] }[];
}

export interface ClassStudentContract {
  id: number;
  student_id: number;
  name: string;
  nisn: string;
  jenis_kelamin: "L" | "P" | null;
  is_claimed: boolean;
  joined_at: string | null;
}

export interface ClassStudentsResponseContract {
  data: ClassStudentContract[];
}

export interface CreateClassErrorContract {
  message: string;
  errors: { name?: string[] };
}

export interface ImportStudentsErrorContract {
  message: string;
  errors: { file?: string[] };
}
