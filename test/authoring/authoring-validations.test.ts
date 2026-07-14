import { describe, expect, it } from "vitest";

import { challengeFormSchema, questionFormSchema, toDateTimeLocal } from "@/lib/authoring-validations";

const baseQuestion = {
  questionType: "pilihan_ganda" as const,
  questionText: "Manakah jawaban benar?",
  points: "10",
  sortOrder: "0",
  timeLimitSeconds: "30",
  correctAnswerText: "",
  options: [
    { optionText: "A", isCorrect: false, sortOrder: "0" },
    { optionText: "B", isCorrect: false, sortOrder: "1" },
  ],
};

describe("authoring validation", () => {
  it("menolak PG tanpa atau dengan lebih dari satu jawaban benar", () => {
    expect(questionFormSchema.safeParse(baseQuestion).success).toBe(false);
    expect(questionFormSchema.safeParse({
      ...baseQuestion,
      options: baseQuestion.options.map((option) => ({ ...option, isCorrect: true })),
    }).success).toBe(false);
  });

  it("menerima PG dengan tepat satu jawaban benar", () => {
    const parsed = questionFormSchema.safeParse({
      ...baseQuestion,
      options: baseQuestion.options.map((option, index) => ({ ...option, isCorrect: index === 0 })),
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.options?.[0].isCorrect).toBe(true);
  });

  it("mewajibkan jawaban isian dan meniadakan jawaban esai", () => {
    expect(questionFormSchema.safeParse({ ...baseQuestion, questionType: "isian_singkat", options: [], correctAnswerText: "" }).success).toBe(false);
    expect(questionFormSchema.safeParse({ ...baseQuestion, questionType: "esai", options: [], correctAnswerText: "jawaban" }).success).toBe(false);
    const essay = questionFormSchema.safeParse({ ...baseQuestion, questionType: "esai", options: [], correctAnswerText: "" });
    expect(essay.success && essay.data.correctAnswerText).toBeNull();
  });

  it("menolak jadwal selesai sebelum mulai dan menserialisasi waktu lokal", () => {
    const invalid = challengeFormSchema.safeParse({
      title: "Kuis", description: "", type: "kuis", pointsReward: "0",
      startTime: "2026-07-20T10:00", endTime: "2026-07-20T09:00", timerSeconds: "",
    });
    expect(invalid.success).toBe(false);
    const valid = challengeFormSchema.safeParse({
      title: "Kuis", description: "", type: "kuis", pointsReward: "0",
      startTime: "2026-07-20T08:00", endTime: "2026-07-20T10:00", timerSeconds: "600",
    });
    expect(valid.success && valid.data.startTime).toBe("2026-07-20T08:00:00+07:00");
  });

  it("menampilkan waktu input selalu dalam Asia/Jakarta", () => {
    expect(toDateTimeLocal("2026-07-20T01:00:00Z")).toBe("2026-07-20T08:00");
    expect(toDateTimeLocal("2026-07-20T08:00:00+07:00")).toBe("2026-07-20T08:00");
  });
});
