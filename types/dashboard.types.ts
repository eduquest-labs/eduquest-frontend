export interface DashboardActivity {
  id: number;
  studentName: string;
  challengeTitle: string;
  classId: number;
  className: string;
  startedAt: string;
  isLocked: boolean;
  totalScore: number | null;
}

export interface GuruDashboard {
  totalStudents: number;
  activeChallenges: number;
  averageScore: number;
  recentActivity: DashboardActivity[];
}
