import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AttemptPageClient } from "@/components/attempts";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const baseAttempt = {
  id: 4,
  challenge_id: 1,
  student_id: 8,
  started_at: "2026-07-18T08:00:00+07:00",
  finished_at: null,
  deadline_at: null,
  is_locked: false,
  total_score: null,
  grading_status: "pending",
  student: { id: 8, name: "Siswa A" },
  challenge: {
    id: 1,
    title: "Kuis",
    description: null,
    type: "kuis",
    timer_seconds: null,
    availability_status: "active",
  },
  questions: [{
    id: 9,
    question_type: "esai",
    question_text: "Jelaskan",
    points: 10,
    sort_order: 0,
    time_limit_seconds: null,
    options: [],
  }],
  answers: [{
    id: 11,
    attempt_id: 4,
    question_id: 9,
    selected_option_id: null,
    answer_text: "Jawaban",
    is_correct: null,
    score_awarded: null,
    feedback: null,
    graded_at: null,
    has_attachment: false,
    created_at: "a",
    updated_at: "a",
  }],
};

describe("AttemptPageClient", () => {
  it("tidak menampilkan skor 0 saat esai masih menunggu penilaian", async () => {
    server.use(
      http.get("*/challenges/1/attempts/current", () => HttpResponse.json(baseAttempt)),
      http.post("*/attempts/4/finish", () => HttpResponse.json({
        ...baseAttempt,
        finished_at: "2026-07-18T09:00:00+07:00",
        is_locked: true,
      }))
    );

    renderWithProviders(<AttemptPageClient challengeId={1} />);
    fireEvent.click(await screen.findByRole("button", { name: "Selesai dan kunci attempt" }));

    expect(await screen.findByText(/Nilai akhir akan muncul/)).toBeInTheDocument();
    expect(screen.queryByText("0 poin")).not.toBeInTheDocument();
  });
});
