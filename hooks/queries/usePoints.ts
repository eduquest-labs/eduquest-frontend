import { useQuery } from "@tanstack/react-query";

import {
  getMyBadges,
  getMyPoints,
  getStudentPoints,
  listBadges,
} from "@/services/modules";

export const pointsKeys = {
  all: ["points-badges"] as const,
  student: (classId: number, classStudentId: number) =>
    [...pointsKeys.all, "student", classId, classStudentId] as const,
  myPoints: () => [...pointsKeys.all, "mine", "points"] as const,
  badges: () => [...pointsKeys.all, "badges"] as const,
  myBadges: () => [...pointsKeys.all, "mine", "badges"] as const,
};

export function useStudentPoints(classId: number, classStudentId: number) {
  return useQuery({
    queryKey: pointsKeys.student(classId, classStudentId),
    queryFn: () => getStudentPoints(classId, classStudentId),
    enabled: Number.isFinite(classId) && Number.isFinite(classStudentId),
  });
}

export function useMyPoints() {
  return useQuery({ queryKey: pointsKeys.myPoints(), queryFn: getMyPoints });
}

export function useBadges() {
  return useQuery({ queryKey: pointsKeys.badges(), queryFn: listBadges });
}

export function useMyBadges() {
  return useQuery({ queryKey: pointsKeys.myBadges(), queryFn: getMyBadges });
}
