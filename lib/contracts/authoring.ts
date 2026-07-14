import type { ChallengeAvailability, ChallengeType, QuestionType } from "@/types";

export interface TopicContract {
  id: number;
  class_id: number;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ChallengeContract {
  id: number;
  topic_id: number;
  title: string;
  description: string | null;
  type: ChallengeType;
  points_reward: number;
  start_time: string | null;
  end_time: string | null;
  timer_seconds: number | null;
  is_published: boolean;
  availability_status: ChallengeAvailability;
  created_at: string;
  updated_at: string;
}

export interface QuestionOptionContract {
  id: number;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuestionContract {
  id: number;
  challenge_id: number;
  question_type: QuestionType;
  question_text: string;
  points: number;
  sort_order: number;
  time_limit_seconds: number | null;
  correct_answer_text: string | null;
  options: QuestionOptionContract[];
  created_at: string;
  updated_at: string;
}

export interface ListContract<T> {
  data: T[];
}

export interface DuplicateChallengeContract extends ChallengeContract {
  questions: Array<Omit<QuestionContract, "created_at" | "updated_at">>;
}

export interface ValidationErrorContract {
  message: string;
  errors?: Record<string, string[]>;
}
