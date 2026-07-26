export type MonitoringStatus = "in_progress" | "just_submitted";

export interface MonitoringActivity {
  id: number;
  studentName: string;
  challengeTitle: string;
  classId: number;
  className: string;
  startedAt: string;
  finishedAt: string | null;
  status: MonitoringStatus;
  totalScore: number | null;
}
