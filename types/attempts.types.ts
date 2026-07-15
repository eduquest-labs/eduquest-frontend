import type { ChallengeAvailability, ChallengeType, QuestionType } from "./authoring.types";

export interface StudentChallenge {
  id: number;
  classId: number;
  className: string;
  topicId: number;
  topicName: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  pointsReward: number;
  startTime: string | null;
  endTime: string | null;
  timerSeconds: number | null;
  availabilityStatus: ChallengeAvailability;
}

export interface AttemptChallenge {
  id: number;
  title: string;
  description: string | null;
  type: ChallengeType;
  timerSeconds: number | null;
  availabilityStatus: ChallengeAvailability;
}

export interface AttemptQuestionOption {
  id: number;
  optionText: string;
  sortOrder: number;
}

export interface AttemptQuestion {
  id: number;
  questionType: QuestionType;
  questionText: string;
  points: number;
  sortOrder: number;
  timeLimitSeconds: number | null;
  options: AttemptQuestionOption[];
}

export interface AttemptAnswer {
  id: number;
  attemptId: number;
  questionId: number;
  selectedOptionId: number | null;
  answerText: string | null;
  isCorrect: boolean | null;
  scoreAwarded: number | null;
  hasAttachment: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptDetail {
  id: number;
  challengeId: number;
  studentId: number;
  startedAt: string;
  finishedAt: string | null;
  deadlineAt: string | null;
  isLocked: boolean;
  totalScore: number | null;
  challenge: AttemptChallenge;
  questions: AttemptQuestion[];
  answers: AttemptAnswer[];
}

export interface SubmitAnswerInput {
  questionId: number;
  selectedOptionId?: number | null;
  answerText?: string | null;
  attachment?: File | null;
}
