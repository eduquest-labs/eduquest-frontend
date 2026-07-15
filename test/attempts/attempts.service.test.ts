import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getCurrentAttempt, listStudentChallenges, submitAttemptAnswer } from "@/services/modules";
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
});
