import type { ChallengeAvailability, ChallengeType, QuestionType } from "@/types";
import type { GradingStatus } from "@/types";

export interface StudentChallengeContract {
  id: number;
  class_id: number;
  class_name: string;
  topic_id: number;
  topic_name: string;
  title: string;
  description: string | null;
  type: ChallengeType;
  points_reward: number;
  start_time: string | null;
  end_time: string | null;
  timer_seconds: number | null;
  availability_status: ChallengeAvailability;
}

export interface AttemptQuestionOptionContract {
  id: number;
  option_text: string;
  sort_order: number;
}

export interface AttemptQuestionContract {
  id: number;
  question_type: QuestionType;
  question_text: string;
  points: number;
  sort_order: number;
  time_limit_seconds: number | null;
  options: AttemptQuestionOptionContract[];
}

export interface AttemptAnswerContract {
  id: number;
  attempt_id: number;
  question_id: number;
  selected_option_id: number | null;
  answer_text: string | null;
  is_correct: boolean | null;
  score_awarded: number | null;
  feedback: string | null;
  graded_at: string | null;
  has_attachment: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttemptContract {
  id: number;
  challenge_id: number;
  student_id: number;
  started_at: string;
  finished_at: string | null;
  deadline_at: string | null;
  is_locked: boolean;
  total_score: number | null;
  grading_status: GradingStatus;
  student: {
    id: number;
    name: string;
  };
  challenge: {
    id: number;
    title: string;
    description: string | null;
    type: ChallengeType;
    timer_seconds: number | null;
    availability_status: ChallengeAvailability;
  };
  questions: AttemptQuestionContract[];
  answers: AttemptAnswerContract[];
}

export interface AttemptListContract<T> {
  data: T[];
}

export interface PendingGradingAttemptContract {
  id: number;
  student: {
    id: number;
    name: string;
  };
  challenge: {
    id: number;
    title: string;
  };
  finished_at: string | null;
  grading_status: "pending";
  essay_answers_count: number;
  graded_essay_answers_count: number;
}

export interface PendingGradingPageContract {
  data: PendingGradingAttemptContract[];
  next_cursor: string | null;
  prev_cursor: string | null;
}

export interface GradeEssayAnswerResponseContract {
  answer: AttemptAnswerContract;
  attempt: {
    id: number;
    total_score: number | null;
    grading_status: GradingStatus;
  };
}
