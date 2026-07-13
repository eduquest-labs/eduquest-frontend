import { describe, expect, it } from "vitest";

import { adaptChallenge, adaptDuplicatedChallenge, adaptQuestion, adaptTopic } from "@/services/adapters";

describe("authoring adapters", () => {
  it("mengubah kontrak topic dan challenge menjadi camelCase", () => {
    expect(adaptTopic({
      id: 1, class_id: 2, name: "Pertemuan 1", sort_order: 3,
      created_at: "2026-07-13", updated_at: "2026-07-14",
    })).toEqual({
      id: 1, classId: 2, name: "Pertemuan 1", sortOrder: 3,
      createdAt: "2026-07-13", updatedAt: "2026-07-14",
    });

    expect(adaptChallenge({
      id: 4, topic_id: 1, title: "Kuis", description: null, type: "kuis",
      points_reward: 100, start_time: null, end_time: null, timer_seconds: 600,
      is_published: false, created_at: "a", updated_at: "b",
    })).toMatchObject({ id: 4, topicId: 1, pointsReward: 100, timerSeconds: 600, isPublished: false });
  });

  it("mengubah question beserta options", () => {
    const question = adaptQuestion({
      id: 8, challenge_id: 4, question_type: "pilihan_ganda", question_text: "Contoh?",
      points: 10, sort_order: 0, time_limit_seconds: 30, correct_answer_text: null,
      options: [{ id: 9, option_text: "Jogging", is_correct: true, sort_order: 0 }],
      created_at: "a", updated_at: "b",
    });
    expect(question.options[0]).toEqual({ id: 9, optionText: "Jogging", isCorrect: true, sortOrder: 0 });
  });

  it("menerima question duplicate tanpa timestamp", () => {
    const duplicate = adaptDuplicatedChallenge({
      id: 10, topic_id: 7, title: "Kuis", description: null, type: "kuis",
      points_reward: 0, start_time: null, end_time: null, timer_seconds: null,
      is_published: false, created_at: "a", updated_at: "b",
      questions: [{
        id: 11, challenge_id: 10, question_type: "esai", question_text: "Jelaskan",
        points: 20, sort_order: 0, time_limit_seconds: null, correct_answer_text: null, options: [],
      }],
    });
    expect(duplicate.isPublished).toBe(false);
    expect(duplicate.questions[0]).not.toHaveProperty("createdAt");
  });
});
