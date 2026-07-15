import type {
  AttemptAnswerContract,
  AttemptContract,
  AttemptQuestionContract,
  StudentChallengeContract,
} from "@/lib/contracts/attempts";
import type { AttemptAnswer, AttemptDetail, AttemptQuestion, StudentChallenge } from "@/types";

export function adaptStudentChallenge(contract: StudentChallengeContract): StudentChallenge {
  return {
    id: contract.id,
    classId: contract.class_id,
    className: contract.class_name,
    topicId: contract.topic_id,
    topicName: contract.topic_name,
    title: contract.title,
    description: contract.description,
    type: contract.type,
    pointsReward: contract.points_reward,
    startTime: contract.start_time,
    endTime: contract.end_time,
    timerSeconds: contract.timer_seconds,
    availabilityStatus: contract.availability_status,
  };
}

export function adaptAttemptQuestion(contract: AttemptQuestionContract): AttemptQuestion {
  return {
    id: contract.id,
    questionType: contract.question_type,
    questionText: contract.question_text,
    points: contract.points,
    sortOrder: contract.sort_order,
    timeLimitSeconds: contract.time_limit_seconds,
    options: contract.options.map((option) => ({
      id: option.id,
      optionText: option.option_text,
      sortOrder: option.sort_order,
    })),
  };
}

export function adaptAttemptAnswer(contract: AttemptAnswerContract): AttemptAnswer {
  return {
    id: contract.id,
    attemptId: contract.attempt_id,
    questionId: contract.question_id,
    selectedOptionId: contract.selected_option_id,
    answerText: contract.answer_text,
    isCorrect: contract.is_correct,
    scoreAwarded: contract.score_awarded,
    hasAttachment: contract.has_attachment,
    createdAt: contract.created_at,
    updatedAt: contract.updated_at,
  };
}

export function adaptAttempt(contract: AttemptContract): AttemptDetail {
  return {
    id: contract.id,
    challengeId: contract.challenge_id,
    studentId: contract.student_id,
    startedAt: contract.started_at,
    finishedAt: contract.finished_at,
    deadlineAt: contract.deadline_at,
    isLocked: contract.is_locked,
    totalScore: contract.total_score,
    challenge: {
      id: contract.challenge.id,
      title: contract.challenge.title,
      description: contract.challenge.description,
      type: contract.challenge.type,
      timerSeconds: contract.challenge.timer_seconds,
      availabilityStatus: contract.challenge.availability_status,
    },
    questions: contract.questions.map(adaptAttemptQuestion),
    answers: contract.answers.map(adaptAttemptAnswer),
  };
}
