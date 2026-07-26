import type { MonitoringStatus } from "@/types";

export interface MonitoringActivityContract {
  id: number;
  student_name: string;
  challenge_title: string;
  class_id: number;
  class_name: string;
  started_at: string;
  finished_at: string | null;
  status: MonitoringStatus;
  total_score: number | null;
}

export interface MonitoringResponseContract {
  data: MonitoringActivityContract[];
}
