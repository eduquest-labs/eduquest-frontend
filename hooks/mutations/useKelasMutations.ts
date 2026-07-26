import { useMutation, useQueryClient } from "@tanstack/react-query";

import { kelasKeys } from "@/hooks/queries";
import {
  addStudent,
  createClass,
  deleteClass,
  importStudents,
  removeStudent,
  updateClass,
  updateStudent,
} from "@/services/modules";
import type { AddStudentInput, CreateClassInput, UpdateClassInput, UpdateStudentInput } from "@/types";

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => createClass(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.lists() });
    },
  });
}

export function useUpdateClass(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateClassInput) => updateClass(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: kelasKeys.lists() });
    },
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: number) => deleteClass(classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.lists() });
    },
  });
}

export function useImportStudents(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importStudents(classId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: kelasKeys.students(classId) });
    },
  });
}

export function useAddStudent(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddStudentInput) => addStudent(classId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: kelasKeys.students(classId) });
    },
  });
}

export function useUpdateStudent(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ studentId, input }: { studentId: number; input: UpdateStudentInput }) =>
      updateStudent(classId, studentId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.students(classId) });
    },
  });
}

export function useRemoveStudent(classId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (studentId: number) => removeStudent(classId, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: kelasKeys.detail(classId) });
      queryClient.invalidateQueries({ queryKey: kelasKeys.students(classId) });
    },
  });
}
