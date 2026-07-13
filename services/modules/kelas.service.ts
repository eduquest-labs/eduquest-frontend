import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import {
  adaptClassDetail,
  adaptClassListItem,
  adaptClassStudent,
  adaptCreatedClass,
} from "@/services/adapters";
import type {
  ClassDetailContract,
  ClassListResponseContract,
  ClassStudentContract,
  ClassStudentsResponseContract,
  CreateClassResponseContract,
  ImportStudentsResponseContract,
} from "@/lib/contracts/kelas";
import type {
  AddStudentInput,
  ClassStudent,
  CreateClassInput,
  ImportStudentsResult,
  KelasClass,
  UpdateStudentInput,
} from "@/types";

export async function listClasses(): Promise<KelasClass[]> {
  const { data } = await client.get<ClassListResponseContract>(API_ENDPOINTS.KELAS.LIST);
  return data.data.map(adaptClassListItem);
}

export async function getClass(id: number): Promise<KelasClass> {
  const { data } = await client.get<ClassDetailContract>(API_ENDPOINTS.KELAS.DETAIL(id));
  return adaptClassDetail(data);
}

export async function createClass(
  input: CreateClassInput
): Promise<Omit<KelasClass, "studentCount">> {
  const { data } = await client.post<CreateClassResponseContract>(API_ENDPOINTS.KELAS.CREATE, {
    name: input.name,
  });
  return adaptCreatedClass(data);
}

export async function listClassStudents(classId: number): Promise<ClassStudent[]> {
  const { data } = await client.get<ClassStudentsResponseContract>(
    API_ENDPOINTS.KELAS.STUDENTS(classId)
  );
  return data.data.map(adaptClassStudent);
}

export async function addStudent(classId: number, input: AddStudentInput): Promise<ClassStudent> {
  const { data } = await client.post<ClassStudentContract>(
    API_ENDPOINTS.KELAS.STUDENTS(classId),
    input
  );
  return adaptClassStudent(data);
}

export async function updateStudent(
  classId: number,
  studentId: number,
  input: UpdateStudentInput
): Promise<ClassStudent> {
  const { data } = await client.patch<ClassStudentContract>(
    API_ENDPOINTS.KELAS.STUDENT(classId, studentId),
    input
  );
  return adaptClassStudent(data);
}

export async function removeStudent(classId: number, studentId: number): Promise<void> {
  await client.delete(API_ENDPOINTS.KELAS.STUDENT(classId, studentId));
}

export async function importStudents(classId: number, file: File): Promise<ImportStudentsResult> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await client.post<ImportStudentsResponseContract>(
    API_ENDPOINTS.KELAS.IMPORT_STUDENTS(classId),
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return { imported: data.imported, failures: data.failures };
}
