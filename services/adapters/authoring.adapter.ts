import type {
  ChallengeContract,
  DuplicateChallengeContract,
  QuestionContract,
  QuestionOptionContract,
  TopicContract,
} from "@/lib/contracts/authoring";
import type { Challenge, DuplicatedChallenge, Question, QuestionOption, Topic } from "@/types";

export function adaptTopic(contract: TopicContract): Topic {
  return {
    id: contract.id,
    classId: contract.class_id,
    name: contract.name,
    sortOrder: contract.sort_order,
    createdAt: contract.created_at,
    updatedAt: contract.updated_at,
  };
}

export function adaptChallenge(contract: ChallengeContract): Challenge {
  return {
    id: contract.id,
    topicId: contract.topic_id,
    title: contract.title,
    description: contract.description,
    type: contract.type,
    pointsReward: contract.points_reward,
    startTime: contract.start_time,
    endTime: contract.end_time,
    timerSeconds: contract.timer_seconds,
    isPublished: contract.is_published,
    createdAt: contract.created_at,
    updatedAt: contract.updated_at,
  };
}

export function adaptQuestionOption(contract: QuestionOptionContract): QuestionOption {
  return {
    id: contract.id,
    optionText: contract.option_text,
    isCorrect: contract.is_correct,
    sortOrder: contract.sort_order,
  };
}

export function adaptQuestion(contract: QuestionContract): Question {
  return {
    id: contract.id,
    challengeId: contract.challenge_id,
    questionType: contract.question_type,
    questionText: contract.question_text,
    points: contract.points,
    sortOrder: contract.sort_order,
    timeLimitSeconds: contract.time_limit_seconds,
    correctAnswerText: contract.correct_answer_text,
    options: contract.options.map(adaptQuestionOption),
    createdAt: contract.created_at,
    updatedAt: contract.updated_at,
  };
}

export function adaptDuplicatedChallenge(contract: DuplicateChallengeContract): DuplicatedChallenge {
  return {
    ...adaptChallenge(contract),
    questions: contract.questions.map((question) => ({
      id: question.id,
      challengeId: question.challenge_id,
      questionType: question.question_type,
      questionText: question.question_text,
      points: question.points,
      sortOrder: question.sort_order,
      timeLimitSeconds: question.time_limit_seconds,
      correctAnswerText: question.correct_answer_text,
      options: question.options.map(adaptQuestionOption),
    })),
  };
}
