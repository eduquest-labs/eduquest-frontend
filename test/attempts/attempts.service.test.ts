import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import {
  downloadAnswerAttachment,
  getCurrentAttempt,
  gradeEssayAnswer,
  listPendingGradingAttempts,
  listStudentChallenges,
  submitAttemptAnswer,
} from "@/services/modules";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { server } from "@/test/msw/server";

describe("attempt services", () => {
  it("memuat discovery challenge", async () => {
    server.use(http.get("*/student/challenges", () => HttpResponse.json({ data: [{
      id: 1, class_id: 2, class_name: "Kelas", topic_id: 3, topic_name: "Topik", title: "Kuis",
      description: null, type: "kuis", points_reward: 10, start_time: null, end_time: null,
      timer_seconds: null, availability_status: "active",
    }] })));
    await expect(listStudentChallenges()).resolves.toEqual([expect.objectContaining({ classId: 2, topicName: "Topik" })]);
  });

  it("memetakan current 204 menjadi null", async () => {
    server.use(http.get("*/challenges/1/attempts/current", () => new HttpResponse(null, { status: 204 })));
    await expect(getCurrentAttempt(1)).resolves.toBeNull();
  });

  it("mengirim attachment sebagai multipart FormData", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({ accessToken: "test-token" })),
      http.post("*/attempts/4/answers", async ({ request }) => {
      const body = await request.formData();
      expect(body.get("question_id")).toBe("9");
      expect(body.get("answer_text")).toBe("Bukti");
      expect(body.get("attachment")).toMatchObject({ type: "image/jpeg", size: expect.any(Number) });
      return HttpResponse.json({ id: 5, attempt_id: 4, question_id: 9, selected_option_id: null, answer_text: "Bukti", is_correct: null, score_awarded: null, has_attachment: true, created_at: "a", updated_at: "a" });
      })
    );
    const result = await submitAttemptAnswer(4, { questionId: 9, answerText: "Bukti", attachment: new File(["x"], "bukti.jpg", { type: "image/jpeg" }) });
    expect(result).toMatchObject({ attemptId: 4, hasAttachment: true });
  });

  it("memetakan cursor antrean grading dan mengirim PATCH grading", async () => {
    server.use(
      http.get("*/classes/2/attempts/pending-grading", ({ request }) => {
        expect(new URL(request.url).searchParams.get("cursor")).toBe("next-token");
        return HttpResponse.json({
          data: [{
            id: 4,
            student: { id: 8, name: "Siswa A" },
            challenge: { id: 1, title: "Kuis" },
            finished_at: "2026-07-18T09:00:00+07:00",
            grading_status: "pending",
            essay_answers_count: 2,
            graded_essay_answers_count: 1,
          }],
          next_cursor: "after-token",
          prev_cursor: null,
        });
      }),
      http.patch("*/answers/11/grade", async ({ request }) => {
        expect(await request.json()).toEqual({
          score_awarded: 8,
          feedback: "Bagus",
        });
        return HttpResponse.json({
          answer: {
            id: 11,
            attempt_id: 4,
            question_id: 9,
            selected_option_id: null,
            answer_text: "Jawaban",
            is_correct: null,
            score_awarded: 8,
            feedback: "Bagus",
            graded_at: "2026-07-18T10:00:00+07:00",
            has_attachment: false,
            created_at: "a",
            updated_at: "b",
          },
          attempt: { id: 4, total_score: null, grading_status: "pending" },
        });
      })
    );

    await expect(listPendingGradingAttempts(2, "next-token")).resolves.toEqual({
      data: [expect.objectContaining({ id: 4, essayAnswersCount: 2, gradedEssayAnswersCount: 1 })],
      nextCursor: "after-token",
      previousCursor: null,
    });
    await expect(gradeEssayAnswer(11, { scoreAwarded: 8, feedback: "Bagus" }))
      .resolves.toMatchObject({
        answer: { id: 11, scoreAwarded: 8, feedback: "Bagus" },
        attempt: { id: 4, totalScore: null, gradingStatus: "pending" },
      });
  });

  it("mengunduh lampiran terautentikasi sebagai blob", async () => {
    const blob = new Blob(["file-content"], { type: "image/jpeg" });
    const get = vi.spyOn(client, "get").mockResolvedValueOnce({
      data: blob,
      headers: { "content-disposition": 'attachment; filename="bukti.jpg"' },
    });

    try {
      const result = await downloadAnswerAttachment(11);
      expect(result.filename).toBe("bukti.jpg");
      expect(result.blob).toBe(blob);
      expect(get).toHaveBeenCalledWith(API_ENDPOINTS.ATTEMPTS.ATTACHMENT(11), {
        responseType: "blob",
      });
    } finally {
      get.mockRestore();
    }
  });
});
