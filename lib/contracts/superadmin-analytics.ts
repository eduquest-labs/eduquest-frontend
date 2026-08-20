export interface SchoolComparisonContract {
  school_id: number;
  school_name: string;
  student_count: number;
  locked_attempt_count: number;
  scored_attempt_count: number;
  average_score: number | null;
  minimum_score: number | null;
  maximum_score: number | null;
  median_score: number | null;
}

export interface SchoolComparisonResponseContract {
  data: SchoolComparisonContract[];
}
