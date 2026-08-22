export interface TermContract {
  id: number;
  class_id: number;
  name: string;
  sort_order: number;
  threshold_percent: string;
  release_at: string | null;
  randomize_questions: boolean;
}

export interface TermListResponseContract {
  data: TermContract[];
}

export interface TermThresholdHistoryEntryContract {
  old_threshold: string | null;
  new_threshold: string;
  changed_by: number;
  created_at: string;
}

export interface TermThresholdHistoryResponseContract {
  data: TermThresholdHistoryEntryContract[];
}

export interface StudentTermProgressEntryContract {
  class_student_id: number;
  student_name: string;
  status: "in_progress" | "passed" | "failed";
  source: "auto" | "override";
  feedback: string | null;
}

export interface StudentTermProgressResponseContract {
  data: StudentTermProgressEntryContract[];
}

export interface StudentOwnTermProgressEntryContract {
  term_id: number;
  term_name: string;
  sort_order: number;
  status: "in_progress" | "passed" | "failed";
  source: "auto" | "override";
}

export interface StudentOwnTermProgressResponseContract {
  data: StudentOwnTermProgressEntryContract[];
}
