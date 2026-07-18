import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  EssayGradingDetailPageClient,
  EssayGradingQueuePageClient,
} from "@/components/essay-grading";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const replace = vi.fn();
const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push }),
}));

describe("essay grading pages", () => {
  beforeEach(() => {
    replace.mockReset();
    push.mockReset();
  });

  it("menampilkan antrean pending berdasarkan kelas", async () => {
    server.use(
      http.get("*/classes", () => HttpResponse.json({
        data: [{ id: 2, name: "Kelas A", class_code: "ABC", student_count: 1, created_at: "a" }],
      })),
      http.get("*/classes/2/attempts/pending-grading", () => HttpResponse.json({
        data: [{
          id: 4,
          student: { id: 8, name: "Siswa A" },
          challenge: { id: 1, title: "Kuis Kebugaran" },
          finished_at: "2026-07-18T09:00:00+07:00",
          grading_status: "pending",
          essay_answers_count: 2,
          graded_essay_answers_count: 1,
        }],
        next_cursor: null,
        prev_cursor: null,
      }))
    );

    renderWithProviders(<EssayGradingQueuePageClient initialClassId={2} />);

    expect(await screen.findByText("Siswa A")).toBeInTheDocument();
    expect(screen.getByText("1 dari 2 esai sudah dinilai")).toBeInTheDocument();
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });

  it("menampilkan detail jawaban, lampiran, form, dan status pending", async () => {
    server.use(http.get("*/attempts/4", () => HttpResponse.json({
      id: 4,
      challenge_id: 1,
      student_id: 8,
      started_at: "2026-07-18T08:00:00+07:00",
      finished_at: "2026-07-18T09:00:00+07:00",
      deadline_at: null,
      is_locked: true,
      total_score: null,
      grading_status: "pending",
      student: { id: 8, name: "Siswa A" },
      challenge: {
        id: 1,
        title: "Kuis Kebugaran",
        description: null,
        type: "kuis",
        timer_seconds: null,
        availability_status: "ended",
      },
      questions: [{
        id: 9,
        question_type: "esai",
        question_text: "Jelaskan manfaat pemanasan",
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
        answer_text: "Mencegah cedera",
        is_correct: null,
        score_awarded: null,
        feedback: null,
        graded_at: null,
        has_attachment: true,
        created_at: "a",
        updated_at: "a",
      }],
    })));

    renderWithProviders(<EssayGradingDetailPageClient attemptId={4} classId={2} />);

    expect(await screen.findByRole("heading", { name: "Siswa A" })).toBeInTheDocument();
    expect(screen.getByText("Mencegah cedera")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Unduh lampiran/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Simpan nilai" })).toBeInTheDocument();
    expect(screen.getByText("Nilai akhir masih ditahan")).toBeInTheDocument();
  });
});
