import type {
  AttemptAnswerContract,
  AttemptContract,
  AttemptHistoryPageContract,
  AttemptListContract,
  GradeEssayAnswerResponseContract,
  PendingGradingPageContract,
  StudentChallengeContract,
} from "@/lib/contracts/attempts";
import {
  adaptAttempt,
  adaptAttemptAnswer,
  adaptAttemptHistoryPage,
  adaptGradeEssayResult,
  adaptPendingGradingPage,
  adaptStudentChallenge,
} from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type {
  AttemptAnswer,
  AttemptDetail,
  AttemptHistoryFilters,
  AttemptHistoryPage,
  DownloadedAttachment,
  GradeEssayInput,
  GradeEssayResult,
  PendingGradingPage,
  StudentChallenge,
  SubmitAnswerInput,
} from "@/types";

export async function listStudentChallenges(): Promise<StudentChallenge[]> {
  const { data } = await client.get<AttemptListContract<StudentChallengeContract>>(
    API_ENDPOINTS.ATTEMPTS.DISCOVERY
  );
  return data.data.map(adaptStudentChallenge);
}

export async function startAttempt(challengeId: number): Promise<AttemptDetail> {
  const { data } = await client.post<AttemptContract>(API_ENDPOINTS.ATTEMPTS.START(challengeId));
  return adaptAttempt(data);
}

export async function getCurrentAttempt(challengeId: number): Promise<AttemptDetail | null> {
  const response = await client.get<AttemptContract>(API_ENDPOINTS.ATTEMPTS.CURRENT(challengeId));
  return response.status === 204 ? null : adaptAttempt(response.data);
}

export async function getAttempt(attemptId: number): Promise<AttemptDetail> {
  const { data } = await client.get<AttemptContract>(API_ENDPOINTS.ATTEMPTS.DETAIL(attemptId));
  return adaptAttempt(data);
}

export async function getLatestAttempt(challengeId: number): Promise<AttemptDetail | null> {
  const response = await client.get<AttemptContract>(API_ENDPOINTS.ATTEMPTS.LATEST(challengeId));
  return response.status === 204 ? null : adaptAttempt(response.data);
}

export async function submitAttemptAnswer(
  attemptId: number,
  input: SubmitAnswerInput
): Promise<AttemptAnswer> {
  const payload = input.attachment
    ? (() => {
        const form = new FormData();
        form.append("question_id", String(input.questionId));
        if (input.selectedOptionId != null) form.append("selected_option_id", String(input.selectedOptionId));
        if (input.answerText != null) form.append("answer_text", input.answerText);
        form.append("attachment", input.attachment);
        return form;
      })()
    : {
        question_id: input.questionId,
        selected_option_id: input.selectedOptionId ?? null,
        answer_text: input.answerText ?? null,
      };

  const { data } = await client.post<AttemptAnswerContract>(
    API_ENDPOINTS.ATTEMPTS.SUBMIT_ANSWER(attemptId),
    payload
  );
  return adaptAttemptAnswer(data);
}

export async function finishAttempt(attemptId: number): Promise<AttemptDetail> {
  const { data } = await client.post<AttemptContract>(API_ENDPOINTS.ATTEMPTS.FINISH(attemptId));
  return adaptAttempt(data);
}

export async function listPendingGradingAttempts(
  classId: number,
  cursor: string | null
): Promise<PendingGradingPage> {
  const { data } = await client.get<PendingGradingPageContract>(
    API_ENDPOINTS.ATTEMPTS.PENDING_GRADING(classId),
    { params: cursor ? { cursor } : undefined }
  );
  return adaptPendingGradingPage(data);
}

export async function listAttemptHistory(
  filters: AttemptHistoryFilters = {},
  cursor: string | null = null
): Promise<AttemptHistoryPage> {
  const { data } = await client.get<AttemptHistoryPageContract>(API_ENDPOINTS.ATTEMPTS.HISTORY, {
    params: {
      ...(cursor ? { cursor } : {}),
      ...(filters.classId ? { class_id: filters.classId } : {}),
      ...(filters.topicId ? { topic_id: filters.topicId } : {}),
    },
  });

  return adaptAttemptHistoryPage(data);
}

export async function gradeEssayAnswer(
  answerId: number,
  input: GradeEssayInput
): Promise<GradeEssayResult> {
  const { data } = await client.patch<GradeEssayAnswerResponseContract>(
    API_ENDPOINTS.ATTEMPTS.GRADE_ESSAY(answerId),
    {
      score_awarded: input.scoreAwarded,
      feedback: input.feedback,
    }
  );
  return adaptGradeEssayResult(data);
}

export async function downloadAnswerAttachment(answerId: number): Promise<DownloadedAttachment> {
  const response = await client.get<Blob>(API_ENDPOINTS.ATTEMPTS.ATTACHMENT(answerId), {
    responseType: "blob",
  });
  const disposition = response.headers["content-disposition"] as string | undefined;
  const encodedFilename = disposition?.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const quotedFilename = disposition?.match(/filename="?([^";]+)"?/i)?.[1];

  return {
    blob: response.data,
    filename: encodedFilename
      ? decodeURIComponent(encodedFilename)
      : quotedFilename ?? `lampiran-jawaban-${answerId}`,
  };
}
