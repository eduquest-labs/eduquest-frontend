import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import {
  adaptStudentOwnTermProgressEntry,
  adaptStudentTermProgressEntry,
  adaptTerm,
  adaptTermThresholdHistoryEntry,
} from "@/services/adapters";
import type {
  StudentOwnTermProgressResponseContract,
  StudentTermProgressResponseContract,
  TermContract,
  TermListResponseContract,
  TermThresholdHistoryResponseContract,
} from "@/lib/contracts/term";
import type {
  StudentOwnTermProgress,
  StudentTermProgressEntry,
  Term,
  TermInput,
  TermProgressStatus,
  TermThresholdHistoryEntry,
} from "@/types";

export async function listTerms(classId: number): Promise<Term[]> {
  const { data } = await client.get<TermListResponseContract>(API_ENDPOINTS.TERM.LIST(classId));
  return data.data.map(adaptTerm);
}

export async function createTerm(classId: number, input: TermInput): Promise<Term> {
  const { data } = await client.post<TermContract>(API_ENDPOINTS.TERM.CREATE(classId), {
    name: input.name,
    sort_order: input.sortOrder,
    threshold_percent: input.thresholdPercent,
    release_at: input.releaseAt,
    randomize_questions: input.randomizeQuestions,
  });
  return adaptTerm(data);
}

export async function updateTerm(termId: number, input: Partial<TermInput>): Promise<Term> {
  const { data } = await client.patch<TermContract>(API_ENDPOINTS.TERM.UPDATE(termId), {
    ...(input.name !== undefined && { name: input.name }),
    ...(input.sortOrder !== undefined && { sort_order: input.sortOrder }),
    ...(input.thresholdPercent !== undefined && { threshold_percent: input.thresholdPercent }),
    ...(input.releaseAt !== undefined && { release_at: input.releaseAt }),
    ...(input.randomizeQuestions !== undefined && { randomize_questions: input.randomizeQuestions }),
  });
  return adaptTerm(data);
}

export async function getThresholdHistory(termId: number): Promise<TermThresholdHistoryEntry[]> {
  const { data } = await client.get<TermThresholdHistoryResponseContract>(
    API_ENDPOINTS.TERM.THRESHOLD_HISTORY(termId)
  );
  return data.data.map(adaptTermThresholdHistoryEntry);
}

export async function getTermProgress(termId: number): Promise<StudentTermProgressEntry[]> {
  const { data } = await client.get<StudentTermProgressResponseContract>(API_ENDPOINTS.TERM.PROGRESS(termId));
  return data.data.map(adaptStudentTermProgressEntry);
}

export async function overrideTermProgress(
  termId: number,
  classStudentId: number,
  status: TermProgressStatus | null,
  feedback?: string
): Promise<void> {
  await client.patch(API_ENDPOINTS.TERM.OVERRIDE(termId, classStudentId), { status, feedback });
}

export async function getMyTerms(): Promise<StudentOwnTermProgress[]> {
  const { data } = await client.get<StudentOwnTermProgressResponseContract>(API_ENDPOINTS.TERM.MY_TERMS);
  return data.data.map(adaptStudentOwnTermProgressEntry);
}
