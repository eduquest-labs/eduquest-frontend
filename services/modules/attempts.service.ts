import type {
  AttemptAnswerContract,
  AttemptContract,
  AttemptListContract,
  StudentChallengeContract,
} from "@/lib/contracts/attempts";
import { adaptAttempt, adaptAttemptAnswer, adaptStudentChallenge } from "@/services/adapters";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { AttemptAnswer, AttemptDetail, StudentChallenge, SubmitAnswerInput } from "@/types";

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
