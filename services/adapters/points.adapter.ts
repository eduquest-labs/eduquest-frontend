import type {
  BadgeContract,
  MyPointsResponseContract,
  PointAdjustmentContract,
  StudentBadgeContract,
  StudentPointsDetailContract,
} from "@/lib/contracts/points";
import type {
  BadgeDefinition,
  MyPointsSummary,
  PointAdjustment,
  StudentBadge,
  StudentPointsDetail,
} from "@/types";

export function adaptBadge(contract: BadgeContract): BadgeDefinition {
  return {
    id: contract.id,
    name: contract.name,
    description: contract.description,
    criteriaType: contract.criteria_type,
    criteriaValue: contract.criteria_value,
  };
}

export function adaptStudentBadge(contract: StudentBadgeContract): StudentBadge {
  return {
    id: contract.id,
    badge: adaptBadge(contract.badge),
    awardedAt: contract.awarded_at,
    awardedBy: contract.awarded_by,
    awardSource: contract.award_source,
  };
}

export function adaptPointAdjustment(contract: PointAdjustmentContract): PointAdjustment {
  return {
    id: contract.id,
    points: contract.points,
    reason: contract.reason,
    adjustedBy: contract.adjusted_by,
    createdAt: contract.created_at,
  };
}

export function adaptStudentPointsDetail(
  contract: StudentPointsDetailContract
): StudentPointsDetail {
  return {
    classInfo: contract.class,
    student: {
      id: contract.student.id,
      classStudentId: contract.student.class_student_id,
      name: contract.student.name,
    },
    totalPoints: contract.total_points,
    lastSyncedAt: contract.last_synced_at,
    adjustments: contract.adjustments.map(adaptPointAdjustment),
    badges: contract.badges.map(adaptStudentBadge),
  };
}

export function adaptMyPoints(contract: MyPointsResponseContract): MyPointsSummary {
  return {
    totalPoints: contract.total_points,
    classes: contract.classes.map((classPoints) => ({
      id: classPoints.id,
      classStudentId: classPoints.class_student_id,
      name: classPoints.name,
      totalPoints: classPoints.total_points,
      lastSyncedAt: classPoints.last_synced_at,
    })),
    nextBadge: contract.next_badge ? adaptBadge(contract.next_badge) : null,
  };
}
