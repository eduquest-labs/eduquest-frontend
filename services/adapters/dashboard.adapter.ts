import type {
  DashboardActivityContract,
  DosenDashboardContract,
} from "@/lib/contracts/dashboard";
import type { DashboardActivity, DosenDashboard } from "@/types";

export function adaptDashboardActivity(
  contract: DashboardActivityContract
): DashboardActivity {
  return {
    id: contract.id,
    studentName: contract.student_name,
    challengeTitle: contract.challenge_title,
    classId: contract.class_id,
    className: contract.class_name,
    startedAt: contract.started_at,
    isLocked: contract.is_locked,
    totalScore: contract.total_score,
  };
}

export function adaptDosenDashboard(
  contract: DosenDashboardContract
): DosenDashboard {
  return {
    totalStudents: contract.total_students,
    activeChallenges: contract.active_challenges,
    averageScore: contract.average_score,
    recentActivity: contract.recent_activity.map(adaptDashboardActivity),
  };
}
