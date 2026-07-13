import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptChallenge, adaptDuplicatedChallenge, adaptQuestion, adaptTopic } from "@/services/adapters";
import type {
  ChallengeContract,
  DuplicateChallengeContract,
  ListContract,
  QuestionContract,
  TopicContract,
} from "@/lib/contracts/authoring";
import type {
  Challenge,
  ChallengeInput,
  DuplicatedChallenge,
  PublishedQuestionUpdateInput,
  Question,
  QuestionInput,
  Topic,
  TopicInput,
} from "@/types";

function topicPayload(input: Partial<TopicInput>) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.sortOrder !== undefined ? { sort_order: input.sortOrder } : {}),
  };
}

function challengePayload(input: Partial<ChallengeInput>) {
  return {
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.type !== undefined ? { type: input.type } : {}),
    ...(input.pointsReward !== undefined ? { points_reward: input.pointsReward } : {}),
    ...(input.startTime !== undefined ? { start_time: input.startTime } : {}),
    ...(input.endTime !== undefined ? { end_time: input.endTime } : {}),
    ...(input.timerSeconds !== undefined ? { timer_seconds: input.timerSeconds } : {}),
  };
}

function questionPayload(input: Partial<QuestionInput | PublishedQuestionUpdateInput>) {
  const questionInput = input as Partial<QuestionInput>;
  return {
    ...(questionInput.questionType !== undefined
      ? { question_type: questionInput.questionType }
      : {}),
    ...(questionInput.questionText !== undefined
      ? { question_text: questionInput.questionText }
      : {}),
    ...(questionInput.points !== undefined ? { points: questionInput.points } : {}),
    ...(questionInput.sortOrder !== undefined ? { sort_order: questionInput.sortOrder } : {}),
    ...(questionInput.timeLimitSeconds !== undefined
      ? { time_limit_seconds: questionInput.timeLimitSeconds }
      : {}),
    ...(questionInput.correctAnswerText !== undefined
      ? { correct_answer_text: questionInput.correctAnswerText }
      : {}),
    ...(questionInput.options !== undefined
      ? {
          options: questionInput.options.map((option) => ({
            option_text: option.optionText,
            is_correct: option.isCorrect,
            sort_order: option.sortOrder,
          })),
        }
      : {}),
  };
}

export async function listTopics(classId: number): Promise<Topic[]> {
  const { data } = await client.get<ListContract<TopicContract>>(
    API_ENDPOINTS.AUTHORING.TOPICS(classId)
  );
  return data.data.map(adaptTopic);
}

export async function createTopic(classId: number, input: TopicInput): Promise<Topic> {
  const { data } = await client.post<TopicContract>(
    API_ENDPOINTS.AUTHORING.TOPICS(classId),
    topicPayload(input)
  );
  return adaptTopic(data);
}

export async function updateTopic(topicId: number, input: Partial<TopicInput>): Promise<Topic> {
  const { data } = await client.patch<TopicContract>(
    API_ENDPOINTS.AUTHORING.TOPIC(topicId),
    topicPayload(input)
  );
  return adaptTopic(data);
}

export async function deleteTopic(topicId: number): Promise<void> {
  await client.delete(API_ENDPOINTS.AUTHORING.TOPIC(topicId));
}

export async function listChallenges(topicId: number): Promise<Challenge[]> {
  const { data } = await client.get<ListContract<ChallengeContract>>(
    API_ENDPOINTS.AUTHORING.CHALLENGES(topicId)
  );
  return data.data.map(adaptChallenge);
}

export async function createChallenge(
  topicId: number,
  input: ChallengeInput
): Promise<Challenge> {
  const { data } = await client.post<ChallengeContract>(
    API_ENDPOINTS.AUTHORING.CHALLENGES(topicId),
    challengePayload(input)
  );
  return adaptChallenge(data);
}

export async function updateChallenge(
  challengeId: number,
  input: Partial<ChallengeInput>
): Promise<Challenge> {
  const { data } = await client.patch<ChallengeContract>(
    API_ENDPOINTS.AUTHORING.CHALLENGE(challengeId),
    challengePayload(input)
  );
  return adaptChallenge(data);
}

export async function deleteChallenge(challengeId: number): Promise<void> {
  await client.delete(API_ENDPOINTS.AUTHORING.CHALLENGE(challengeId));
}

export async function publishChallenge(challengeId: number): Promise<Challenge> {
  const { data } = await client.patch<ChallengeContract>(
    API_ENDPOINTS.AUTHORING.PUBLISH_CHALLENGE(challengeId)
  );
  return adaptChallenge(data);
}

export async function unpublishChallenge(challengeId: number): Promise<Challenge> {
  const { data } = await client.patch<ChallengeContract>(
    API_ENDPOINTS.AUTHORING.UNPUBLISH_CHALLENGE(challengeId)
  );
  return adaptChallenge(data);
}

export async function duplicateChallenge(
  challengeId: number,
  targetTopicId: number
): Promise<DuplicatedChallenge> {
  const { data } = await client.post<DuplicateChallengeContract>(
    API_ENDPOINTS.AUTHORING.DUPLICATE_CHALLENGE(challengeId),
    { target_topic_id: targetTopicId }
  );
  return adaptDuplicatedChallenge(data);
}

export async function listQuestions(challengeId: number): Promise<Question[]> {
  const { data } = await client.get<ListContract<QuestionContract>>(
    API_ENDPOINTS.AUTHORING.QUESTIONS(challengeId)
  );
  return data.data.map(adaptQuestion);
}

export async function createQuestion(
  challengeId: number,
  input: QuestionInput
): Promise<Question> {
  const { data } = await client.post<QuestionContract>(
    API_ENDPOINTS.AUTHORING.QUESTIONS(challengeId),
    questionPayload(input)
  );
  return adaptQuestion(data);
}

export async function updateQuestion(
  questionId: number,
  input: Partial<QuestionInput> | PublishedQuestionUpdateInput
): Promise<Question> {
  const { data } = await client.patch<QuestionContract>(
    API_ENDPOINTS.AUTHORING.QUESTION(questionId),
    questionPayload(input)
  );
  return adaptQuestion(data);
}

export async function deleteQuestion(questionId: number): Promise<void> {
  await client.delete(API_ENDPOINTS.AUTHORING.QUESTION(questionId));
}
