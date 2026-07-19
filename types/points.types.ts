export type BadgeCriteriaType = "total_points" | "challenges_completed" | "manual";
export type BadgeAwardSource = "automatic" | "manual";

export interface BadgeDefinition {
  id: number;
  name: string;
  description: string | null;
  criteriaType: BadgeCriteriaType;
  criteriaValue: number | null;
}

export interface StudentBadge {
  id: number;
  badge: BadgeDefinition;
  awardedAt: string;
  awardedBy: { id: number; name: string } | null;
  awardSource: BadgeAwardSource;
}

export interface PointAdjustment {
  id: number;
  points: number;
  reason: string;
  adjustedBy: { id: number; name: string };
  createdAt: string;
}

export interface StudentPointsDetail {
  classInfo: { id: number; name: string };
  student: { id: number; classStudentId: number; name: string };
  totalPoints: number;
  lastSyncedAt: string;
  adjustments: PointAdjustment[];
  badges: StudentBadge[];
}

export interface StudentClassPoints {
  id: number;
  classStudentId: number;
  name: string;
  totalPoints: number;
  lastSyncedAt: string | null;
}

export interface MyPointsSummary {
  totalPoints: number;
  classes: StudentClassPoints[];
  nextBadge: BadgeDefinition | null;
}

export interface PointAdjustmentInput {
  points: number;
  reason: string;
}
