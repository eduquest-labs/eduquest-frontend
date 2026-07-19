import type {
  BadgeListResponseContract,
  MyPointsResponseContract,
  PointAdjustmentResponseContract,
  StudentBadgeContract,
  StudentBadgeListResponseContract,
  StudentPointsDetailContract,
} from "@/lib/contracts/points";
import {
  adaptBadge,
  adaptMyPoints,
  adaptPointAdjustment,
  adaptStudentBadge,
  adaptStudentPointsDetail,
} from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type {
  BadgeDefinition,
  MyPointsSummary,
  PointAdjustmentInput,
  StudentBadge,
  StudentPointsDetail,
} from "@/types";

export async function getStudentPoints(
  classId: number,
  classStudentId: number
): Promise<StudentPointsDetail> {
  const { data } = await client.get<StudentPointsDetailContract>(
    API_ENDPOINTS.POINTS_BADGES.STUDENT_POINTS(classId, classStudentId)
  );
  return adaptStudentPointsDetail(data);
}

export async function getMyPoints(): Promise<MyPointsSummary> {
  const { data } = await client.get<MyPointsResponseContract>(
    API_ENDPOINTS.POINTS_BADGES.MY_POINTS
  );
  return adaptMyPoints(data);
}

export async function listBadges(): Promise<BadgeDefinition[]> {
  const { data } = await client.get<BadgeListResponseContract>(
    API_ENDPOINTS.POINTS_BADGES.BADGES
  );
  return data.data.map(adaptBadge);
}

export async function getMyBadges(): Promise<StudentBadge[]> {
  const { data } = await client.get<StudentBadgeListResponseContract>(
    API_ENDPOINTS.POINTS_BADGES.MY_BADGES
  );
  return data.data.map(adaptStudentBadge);
}

export async function createPointAdjustment(
  classId: number,
  classStudentId: number,
  input: PointAdjustmentInput
) {
  const { data } = await client.post<PointAdjustmentResponseContract>(
    API_ENDPOINTS.POINTS_BADGES.ADJUSTMENTS(classId, classStudentId),
    input
  );
  return {
    adjustment: adaptPointAdjustment(data.adjustment),
    totalPoints: data.points.total_points,
    lastSyncedAt: data.points.last_synced_at,
  };
}

export async function awardStudentBadge(
  classId: number,
  classStudentId: number,
  badgeId: number
): Promise<StudentBadge> {
  const { data } = await client.post<StudentBadgeContract>(
    API_ENDPOINTS.POINTS_BADGES.AWARD_BADGE(classId, classStudentId, badgeId)
  );
  return adaptStudentBadge(data);
}
