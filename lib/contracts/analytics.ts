export interface ClassComparisonContract {
  class_id: number;
  class_name: string;
  student_count: number;
  locked_attempt_count: number;
  scored_attempt_count: number;
  average_score: number | null;
  minimum_score: number | null;
  maximum_score: number | null;
  median_score: number | null;
}

export interface ClassComparisonResponseContract {
  data: ClassComparisonContract[];
}

export interface ClassProgressChartPointContract {
  finished_at: string;
  average_score: number;
  challenge_title: string;
}

export interface StudentProgressChartPointContract {
  finished_at: string;
  score: number;
  challenge_title: string;
}

export interface ClassProgressChartResponseContract {
  data: ClassProgressChartPointContract[];
}

export interface StudentProgressChartResponseContract {
  data: StudentProgressChartPointContract[];
}
