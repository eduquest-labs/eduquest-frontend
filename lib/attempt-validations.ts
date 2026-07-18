import { z } from "zod";

const attachmentSchema = z.custom<File | null>(
  (value) => value === null || (typeof File !== "undefined" && value instanceof File),
  "Lampiran tidak valid"
);

export const attemptAnswerSchema = z
  .object({
    questionType: z.enum(["pilihan_ganda", "isian_singkat", "esai"]),
    selectedOptionId: z.number().int().positive().nullable(),
    answerText: z.string().max(10000, "Jawaban esai maksimal 10.000 karakter"),
    attachment: attachmentSchema,
  })
  .superRefine((value, context) => {
    const text = value.answerText.trim();

    if (value.questionType === "pilihan_ganda" && value.selectedOptionId === null) {
      context.addIssue({ code: "custom", path: ["selectedOptionId"], message: "Pilih satu opsi jawaban" });
    }

    if (value.questionType === "isian_singkat") {
      if (!text) {
        context.addIssue({ code: "custom", path: ["answerText"], message: "Jawaban wajib diisi" });
      } else if (text.length > 500) {
        context.addIssue({ code: "custom", path: ["answerText"], message: "Jawaban maksimal 500 karakter" });
      }
    }

    if (value.questionType === "esai" && !text && value.attachment === null) {
      context.addIssue({ code: "custom", path: ["answerText"], message: "Isi teks atau pilih lampiran" });
    }
  });

export type AttemptAnswerFormInput = z.input<typeof attemptAnswerSchema>;

export const essayGradeSchema = (maximumScore: number) =>
  z
    .object({
      scoreAwarded: z
        .string()
        .trim()
        .min(1, "Skor wajib diisi")
        .refine((value) => /^\d+$/.test(value), "Skor harus berupa bilangan bulat")
        .transform(Number)
        .refine((value) => value <= maximumScore, `Skor maksimal ${maximumScore}`),
      feedback: z.string(),
    })
    .transform((value) => ({
      scoreAwarded: value.scoreAwarded,
      feedback: value.feedback.trim() || null,
    }));

export function remainingAttemptSeconds(deadlineAt: string | null, nowMs: number): number | null {
  if (deadlineAt === null) return null;
  return Math.max(0, Math.ceil((new Date(deadlineAt).getTime() - nowMs) / 1000));
}
