export interface DashboardActivityContract {
  id: number;
  student_name: string;
  challenge_title: string;
  class_id: number;
  class_name: string;
  started_at: string;
  is_locked: boolean;
  total_score: number | null;
}

export interface DosenDashboardContract {
  total_students: number;
  active_challenges: number;
  average_score: number;
  recent_activity: DashboardActivityContract[];
}
