export type ChallengeType = "kuis" | "aktivitas_fisik";
export type ChallengeAvailability = "draft" | "scheduled" | "active" | "ended";
export type QuestionType = "pilihan_ganda" | "isian_singkat" | "esai";

export interface Topic {
  id: number;
  classId: number;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge {
  id: number;
  topicId: number;
  title: string;
  description: string | null;
  type: ChallengeType;
  pointsReward: number;
  startTime: string | null;
  endTime: string | null;
  timerSeconds: number | null;
  isPublished: boolean;
  availabilityStatus: ChallengeAvailability;
  createdAt: string;
  updatedAt: string;
}

export interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface Question {
  id: number;
  challengeId: number;
  questionType: QuestionType;
  questionText: string;
  points: number;
  sortOrder: number;
  timeLimitSeconds: number | null;
  correctAnswerText: string | null;
  options: QuestionOption[];
  createdAt: string;
  updatedAt: string;
}

export interface TopicInput {
  name: string;
  sortOrder: number;
}

export interface ChallengeInput {
  title: string;
  description: string | null;
  type: ChallengeType;
  pointsReward: number;
  startTime: string | null;
  endTime: string | null;
  timerSeconds: number | null;
}

export interface QuestionOptionInput {
  optionText: string;
  isCorrect: boolean;
  sortOrder: number;
}

export interface QuestionInput {
  questionType: QuestionType;
  questionText: string;
  points: number;
  sortOrder: number;
  timeLimitSeconds: number | null;
  correctAnswerText: string | null;
  options?: QuestionOptionInput[];
}

export type PublishedQuestionUpdateInput = Pick<
  QuestionInput,
  "questionText" | "points" | "correctAnswerText"
>;

export interface DuplicateChallengeInput {
  targetTopicId: number;
}

export interface DuplicatedChallenge extends Challenge {
  questions: Array<Omit<Question, "createdAt" | "updatedAt">>;
}
