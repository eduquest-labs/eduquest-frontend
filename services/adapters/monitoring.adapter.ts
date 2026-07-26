import type { MonitoringActivityContract } from "@/lib/contracts/monitoring";
import type { MonitoringActivity } from "@/types";

export function adaptMonitoringActivity(
  contract: MonitoringActivityContract
): MonitoringActivity {
  return {
    id: contract.id,
    studentName: contract.student_name,
    challengeTitle: contract.challenge_title,
    classId: contract.class_id,
    className: contract.class_name,
    startedAt: contract.started_at,
    finishedAt: contract.finished_at,
    status: contract.status,
    totalScore: contract.total_score,
  };
}
