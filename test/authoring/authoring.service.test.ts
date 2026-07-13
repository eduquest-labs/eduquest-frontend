import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";
import {
  createChallenge,
  duplicateChallenge,
  listTopics,
  updateQuestion,
} from "@/services/modules";

describe("authoring service", () => {
  it("memuat dan mengadaptasi topic", async () => {
    server.use(http.get("*/classes/1/topics", () => HttpResponse.json({ data: [{
      id: 2, class_id: 1, name: "Pertemuan 1", sort_order: 0,
      created_at: "2026-07-13", updated_at: "2026-07-13",
    }] })));
    await expect(listTopics(1)).resolves.toEqual([expect.objectContaining({ id: 2, classId: 1, sortOrder: 0 })]);
  });

  it("mengirim payload challenge dalam snake_case", async () => {
    server.use(http.post("*/topics/2/challenges", async ({ request }) => {
      const body = await request.json() as Record<string, unknown>;
      expect(body).toMatchObject({ points_reward: 100, timer_seconds: 600, start_time: "2026-07-20 08:00:00" });
      expect(body).not.toHaveProperty("pointsReward");
      return HttpResponse.json({
        id: 3, topic_id: 2, title: "Kuis", description: null, type: "kuis",
        points_reward: 100, start_time: "2026-07-20 08:00:00", end_time: null,
        timer_seconds: 600, is_published: false, created_at: "a", updated_at: "a",
      }, { status: 201 });
    }));
    const challenge = await createChallenge(2, {
      title: "Kuis", description: null, type: "kuis", pointsReward: 100,
      startTime: "2026-07-20 08:00:00", endTime: null, timerSeconds: 600,
    });
    expect(challenge).toMatchObject({ topicId: 2, pointsReward: 100, isPublished: false });
  });

  it("mengirim replace-all options dalam format API", async () => {
    server.use(http.patch("*/questions/9", async ({ request }) => {
      const body = await request.json() as Record<string, unknown>;
      expect(body.options).toEqual([
        { option_text: "Benar", is_correct: true, sort_order: 0 },
        { option_text: "Salah", is_correct: false, sort_order: 1 },
      ]);
      return HttpResponse.json({
        id: 9, challenge_id: 3, question_type: "pilihan_ganda", question_text: "Pilih",
        points: 10, sort_order: 0, time_limit_seconds: null, correct_answer_text: null,
        options: [
          { id: 10, option_text: "Benar", is_correct: true, sort_order: 0 },
          { id: 11, option_text: "Salah", is_correct: false, sort_order: 1 },
        ], created_at: "a", updated_at: "b",
      });
    }));
    const result = await updateQuestion(9, {
      questionType: "pilihan_ganda", questionText: "Pilih", points: 10, sortOrder: 0,
      timeLimitSeconds: null, correctAnswerText: null,
      options: [
        { optionText: "Benar", isCorrect: true, sortOrder: 0 },
        { optionText: "Salah", isCorrect: false, sortOrder: 1 },
      ],
    });
    expect(result.options).toHaveLength(2);
  });

  it("menduplikasi ke target topic dan menerima question tanpa timestamp", async () => {
    server.use(http.post("*/challenges/3/duplicate", async ({ request }) => {
      expect(await request.json()).toEqual({ target_topic_id: 8 });
      return HttpResponse.json({
        id: 20, topic_id: 8, title: "Kuis", description: null, type: "kuis",
        points_reward: 0, start_time: null, end_time: null, timer_seconds: null,
        is_published: false, created_at: "a", updated_at: "a",
        questions: [{ id: 21, challenge_id: 20, question_type: "esai", question_text: "Jelaskan", points: 10, sort_order: 0, time_limit_seconds: null, correct_answer_text: null, options: [] }],
      }, { status: 201 });
    }));
    const result = await duplicateChallenge(3, 8);
    expect(result).toMatchObject({ id: 20, topicId: 8, isPublished: false });
    expect(result.questions).toHaveLength(1);
  });
});
