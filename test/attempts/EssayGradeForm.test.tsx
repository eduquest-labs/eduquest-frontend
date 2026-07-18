import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { EssayGradeForm } from "@/components/essay-grading";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import type { AttemptAnswer, AttemptQuestion } from "@/types";

const question: AttemptQuestion = {
  id: 9,
  questionType: "esai",
  questionText: "Jelaskan manfaat pemanasan",
  points: 10,
  sortOrder: 0,
  timeLimitSeconds: null,
  options: [],
};

const answer: AttemptAnswer = {
  id: 11,
  attemptId: 4,
  questionId: 9,
  selectedOptionId: null,
  answerText: "Mencegah cedera",
  isCorrect: null,
  scoreAwarded: null,
  feedback: null,
  gradedAt: null,
  hasAttachment: false,
  createdAt: "a",
  updatedAt: "a",
};

describe("EssayGradeForm", () => {
  it("memvalidasi skor maksimum sebelum request", async () => {
    renderWithProviders(
      <EssayGradeForm classId={2} attemptId={4} question={question} answer={answer} />
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: /Skor/ }), { target: { value: "11" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan nilai" }));

    expect(await screen.findByText("Skor maksimal 10")).toBeInTheDocument();
  });

  it("menyimpan skor dan feedback lalu menampilkan state regrading", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({ accessToken: "test-token" })),
      http.patch("*/answers/11/grade", async ({ request }) => {
        expect(await request.json()).toEqual({ score_awarded: 8, feedback: "Sudah jelas" });
        return HttpResponse.json({
          answer: {
            id: 11,
            attempt_id: 4,
            question_id: 9,
            selected_option_id: null,
            answer_text: "Mencegah cedera",
            is_correct: null,
            score_awarded: 8,
            feedback: "Sudah jelas",
            graded_at: "2026-07-18T10:00:00+07:00",
            has_attachment: false,
            created_at: "a",
            updated_at: "b",
          },
          attempt: { id: 4, total_score: 8, grading_status: "complete" },
        });
      })
    );
    renderWithProviders(
      <EssayGradeForm classId={2} attemptId={4} question={question} answer={answer} />
    );

    fireEvent.change(screen.getByRole("spinbutton", { name: /Skor/ }), { target: { value: "8" } });
    fireEvent.change(screen.getByRole("textbox", { name: /Feedback/ }), {
      target: { value: "Sudah jelas" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan nilai" }));

    expect(await screen.findByRole("button", { name: "Perbarui nilai" })).toBeInTheDocument();
  });
});
