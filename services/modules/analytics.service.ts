import type {
  ClassComparisonResponseContract,
  ClassProgressChartResponseContract,
  StudentProgressChartResponseContract,
} from "@/lib/contracts/analytics";
import {
  adaptClassComparison,
  adaptClassProgressPoint,
  adaptStudentProgressPoint,
} from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { ClassComparison, ProgressChartData } from "@/types";

export async function getClassComparison(): Promise<ClassComparison[]> {
  const { data } = await client.get<ClassComparisonResponseContract>(
    API_ENDPOINTS.ANALYTICS.CLASS_COMPARISON
  );

  return data.data.map(adaptClassComparison);
}

export async function getProgressChart(
  classId: number,
  studentId?: number
): Promise<ProgressChartData> {
  const endpoint = API_ENDPOINTS.ANALYTICS.PROGRESS_CHART(classId);

  if (studentId !== undefined) {
    const { data } = await client.get<StudentProgressChartResponseContract>(
      endpoint,
      { params: { student_id: studentId } }
    );

    return {
      mode: "student",
      points: data.data.map(adaptStudentProgressPoint),
    };
  }

  const { data } = await client.get<ClassProgressChartResponseContract>(
    endpoint
  );

  return {
    mode: "class",
    points: data.data.map(adaptClassProgressPoint),
  };
}
