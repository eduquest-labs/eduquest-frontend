import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { QuestionForm } from "@/components/authoring";
import { renderWithProviders } from "@/test/helpers/render";

const question = {
  id: 1,
  challengeId: 2,
  questionType: "pilihan_ganda" as const,
  questionText: "Manakah jawaban benar?",
  points: 10,
  sortOrder: 0,
  timeLimitSeconds: 30,
  correctAnswerText: null,
  options: [
    { id: 3, optionText: "A", isCorrect: true, sortOrder: 0 },
    { id: 4, optionText: "B", isCorrect: false, sortOrder: 1 },
  ],
  createdAt: "a",
  updatedAt: "a",
};

describe("QuestionForm published", () => {
  it("mengunci struktur soal dan tetap menampilkan kontrol koreksi", () => {
    renderWithProviders(<QuestionForm question={question} isPublished isPending={false} onSubmit={vi.fn()} />);

    expect(screen.getByRole("combobox", { name: "Tipe soal" })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "Urutan" })).toBeDisabled();
    expect(screen.getByRole("spinbutton", { name: "Batas waktu (detik)" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: /tambah opsi/i })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Pertanyaan" })).toBeEnabled();
    expect(screen.getByRole("spinbutton", { name: "Poin" })).toBeEnabled();
    expect(screen.getByText(/dicatat dalam audit revision/i)).toBeInTheDocument();
  });
});
