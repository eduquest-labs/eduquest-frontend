export interface ResearchSchoolSnapshot {
  school_id: number;
  school_name: string;
  guru_count: number;
  class_count: number;
  student_count: number;
  participant_count: number;
  participation_percent: number | null;
  started_count: number;
  submitted_count: number;
  final_count: number;
  pending_count: number;
  average_raw_score: number | null;
}

export interface ResearchDashboardSnapshot {
  period: { start_date: string; end_date: string; timezone: string };
  generated_at: string;
  overview: {
    school_count: number;
    guru_count: number;
    active_guru_count: number;
    class_count: number;
    student_count: number;
    participant_count: number;
    participation_percent: number | null;
    started_count: number;
    submitted_count: number;
    final_count: number;
    pending_count: number;
    average_raw_score: number | null;
    average_duration_minutes: number | null;
    active_challenge_count: number;
    physical_completed_count: number;
    physical_distance_km: number;
    physical_duration_minutes: number;
    oldest_pending_at: string | null;
  };
  daily: { date: string; started_count: number; submitted_count: number; physical_count: number }[];
  schools: ResearchSchoolSnapshot[];
  challenges: { active: number; scheduled: number; ended: number; draft: number };
}

export interface ResearchDashboardFilters {
  start_date: string;
  end_date: string;
  school_id?: number;
}
