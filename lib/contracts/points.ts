export type BadgeCriteriaTypeContract =
  | "total_points"
  | "challenges_completed"
  | "manual";

export interface BadgeContract {
  id: number;
  name: string;
  description: string | null;
  criteria_type: BadgeCriteriaTypeContract;
  criteria_value: number | null;
}

export interface StudentBadgeContract {
  id: number;
  badge: BadgeContract;
  awarded_at: string;
  awarded_by: { id: number; name: string } | null;
  award_source: "automatic" | "manual";
}

export interface PointAdjustmentContract {
  id: number;
  points: number;
  reason: string;
  adjusted_by: { id: number; name: string };
  created_at: string;
}

export interface StudentPointsDetailContract {
  class: { id: number; name: string };
  student: { id: number; class_student_id: number; name: string };
  total_points: number;
  last_synced_at: string;
  adjustments: PointAdjustmentContract[];
  badges: StudentBadgeContract[];
}

export interface StudentLevelContract {
  level: number;
  current_level_points: number;
  points_to_next_level: number;
  progress_percentage: number;
}

export interface MyPointsResponseContract {
  total_points: number;
  level: StudentLevelContract;
  classes: {
    id: number;
    class_student_id: number;
    name: string;
    total_points: number;
    last_synced_at: string | null;
  }[];
  next_badge: BadgeContract | null;
}

export interface BadgeListResponseContract {
  data: BadgeContract[];
}

export interface StudentBadgeListResponseContract {
  data: StudentBadgeContract[];
}

export interface PointAdjustmentResponseContract {
  adjustment: PointAdjustmentContract;
  points: { total_points: number; last_synced_at: string };
}
