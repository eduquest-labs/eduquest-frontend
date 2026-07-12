import { useQuery } from "@tanstack/react-query";

import { getClass, listClasses, listClassStudents } from "@/services/modules";

export const kelasKeys = {
  all: ["kelas"] as const,
  lists: () => [...kelasKeys.all, "list"] as const,
  details: () => [...kelasKeys.all, "detail"] as const,
  detail: (id: number) => [...kelasKeys.details(), id] as const,
  students: (id: number) => [...kelasKeys.all, "students", id] as const,
};

export function useClasses() {
  return useQuery({
    queryKey: kelasKeys.lists(),
    queryFn: listClasses,
  });
}

export function useClass(id: number) {
  return useQuery({
    queryKey: kelasKeys.detail(id),
    queryFn: () => getClass(id),
    enabled: Number.isFinite(id),
  });
}

export function useClassStudents(id: number) {
  return useQuery({
    queryKey: kelasKeys.students(id),
    queryFn: () => listClassStudents(id),
    enabled: Number.isFinite(id),
  });
}
