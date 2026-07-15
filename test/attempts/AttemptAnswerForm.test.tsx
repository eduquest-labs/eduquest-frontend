import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { AttemptAnswerForm } from "@/components/attempts";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import type { AttemptQuestion } from "@/types";

function question(overrides: Partial<AttemptQuestion>): AttemptQuestion {
  return { id: 9, questionType: "pilihan_ganda", questionText: "Pilih", points: 10, sortOrder: 0, timeLimitSeconds: null, options: [{ id: 1, optionText: "A", sortOrder: 0 }, { id: 2, optionText: "B", sortOrder: 1 }], ...overrides };
}

describe("AttemptAnswerForm", () => {
  it("merender dan menyimpan pilihan ganda", async () => {
    server.use(http.post("*/attempts/4/answers", async ({ request }) => {
      expect(await request.json()).toMatchObject({ question_id: 9, selected_option_id: 2 });
      return HttpResponse.json({ id: 3, attempt_id: 4, question_id: 9, selected_option_id: 2, answer_text: null, is_correct: null, score_awarded: null, has_attachment: false, created_at: "a", updated_at: "a" });
    }));
    renderWithProviders(<AttemptAnswerForm attemptId={4} question={question({})} disabled={false} />);
    fireEvent.click(screen.getByRole("radio", { name: "B" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan jawaban" }));
    expect(await screen.findByText("Jawaban tersimpan")).toBeInTheDocument();
  });

  it("merender input isian singkat", () => {
    renderWithProviders(<AttemptAnswerForm attemptId={4} question={question({ questionType: "isian_singkat", options: [] })} disabled={false} />);
    expect(screen.getByRole("textbox", { name: "Jawaban" })).toBeInTheDocument();
  });

  it("merender textarea dan upload untuk esai", async () => {
    renderWithProviders(<AttemptAnswerForm attemptId={4} question={question({ questionType: "esai", options: [] })} disabled={false} />);
    expect(screen.getByRole("textbox", { name: "Jawaban esai" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Lampiran foto\/video/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Simpan jawaban" }));
    await waitFor(() => expect(screen.getByText("Isi teks atau pilih lampiran")).toBeInTheDocument());
  });
});
