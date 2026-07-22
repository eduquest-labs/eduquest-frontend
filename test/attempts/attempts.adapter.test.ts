import { describe, expect, it } from "vitest";

import { adaptAttempt, adaptAttemptHistoryPage, adaptStudentChallenge } from "@/services/adapters";

describe("attempt adapters", () => {
  it("mengadaptasi discovery challenge ke camelCase", () => {
    expect(adaptStudentChallenge({
      id: 1, class_id: 2, class_name: "Kelas A", topic_id: 3, topic_name: "Topik",
      title: "Kuis", description: null, type: "kuis", points_reward: 100,
      start_time: null, end_time: null, timer_seconds: 600, availability_status: "active",
    })).toMatchObject({ id: 1, classId: 2, topicId: 3, pointsReward: 100, timerSeconds: 600 });
  });

  it("mengadaptasi detail attempt tanpa membutuhkan kunci jawaban authoring", () => {
    const result = adaptAttempt({
      id: 4, challenge_id: 1, student_id: 8, started_at: "2026-07-20T08:00:00+07:00",
      finished_at: null, deadline_at: "2026-07-20T08:10:00+07:00", is_locked: false, total_score: null,
      grading_status: "complete", student: { id: 8, name: "Siswa" },
      challenge: { id: 1, title: "Kuis", description: null, type: "kuis", timer_seconds: 600, availability_status: "active" },
      questions: [{ id: 9, question_type: "pilihan_ganda", question_text: "Pilih", points: 10, sort_order: 0, time_limit_seconds: null, options: [{ id: 10, option_text: "A", sort_order: 0 }] }],
      answers: [{ id: 11, attempt_id: 4, question_id: 9, selected_option_id: 10, answer_text: null, is_correct: null, score_awarded: null, feedback: null, graded_at: null, has_attachment: false, created_at: "a", updated_at: "a" }],
    });
    expect(result).toMatchObject({ id: 4, challengeId: 1, deadlineAt: "2026-07-20T08:10:00+07:00" });
    expect(result.questions[0].options[0]).toEqual({ id: 10, optionText: "A", sortOrder: 0 });
  });

  it("mengadaptasi cursor page riwayat attempt ke camelCase", () => {
    expect(adaptAttemptHistoryPage({
      data: [{
        id: 12,
        challenge: { id: 1, title: "Kuis Lama" },
        topic: { id: 2, name: "Kebugaran" },
        class: { id: 3, name: "Kelas A" },
        started_at: "2026-07-20T08:00:00+07:00",
        finished_at: null,
        is_locked: false,
        total_score: null,
        grading_status: "complete",
      }],
      next_cursor: "next-token",
      prev_cursor: null,
    })).toEqual({
      data: [expect.objectContaining({
        id: 12,
        startedAt: "2026-07-20T08:00:00+07:00",
        finishedAt: null,
        isLocked: false,
        totalScore: null,
        gradingStatus: "complete",
      })],
      nextCursor: "next-token",
      previousCursor: null,
    });
  });
});
