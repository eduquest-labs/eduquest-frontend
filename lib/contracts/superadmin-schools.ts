export interface SchoolWithStatsContract {
  school_id: number;
  school_name: string;
  guru_count: number;
  class_count: number;
  student_count: number;
}

export interface SchoolWithStatsResponseContract {
  data: SchoolWithStatsContract[];
}
