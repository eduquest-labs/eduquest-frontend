import { z } from "zod";

const nonNegativeInteger = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .refine((value) => /^\d+$/.test(value), `${label} harus berupa bilangan bulat`)
    .transform(Number);

const positiveNullableInteger = (label: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), `${label} harus berupa bilangan bulat`)
    .refine((value) => value === "" || Number(value) >= 1, `${label} minimal 1`)
    .transform((value) => (value === "" ? null : Number(value)));

function serializeLocalDateTime(value: string): string | null {
  if (!value) return null;
  return value.length === 16 ? `${value.replace("T", " ")}:00` : value.replace("T", " ");
}

export function toDateTimeLocal(value: string | null): string {
  if (!value) return "";
  const normalized = value.replace(" ", "T");
  return normalized.slice(0, 16);
}

export const topicFormSchema = z.object({
  name: z.string().trim().min(1, "Nama topic wajib diisi").max(150, "Nama topic maksimal 150 karakter"),
  sortOrder: nonNegativeInteger("Urutan"),
});

export type TopicFormInput = z.input<typeof topicFormSchema>;

export const challengeFormSchema = z
  .object({
    title: z.string().trim().min(1, "Judul wajib diisi").max(200, "Judul maksimal 200 karakter"),
    description: z.string().trim().max(5000, "Deskripsi terlalu panjang"),
    type: z.enum(["kuis", "aktivitas_fisik"]),
    pointsReward: nonNegativeInteger("Reward poin"),
    startTime: z.string(),
    endTime: z.string(),
    timerSeconds: positiveNullableInteger("Timer"),
  })
  .superRefine((value, context) => {
    if (value.startTime && value.endTime && value.endTime <= value.startTime) {
      context.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Waktu selesai harus setelah waktu mulai",
      });
    }
  })
  .transform((value) => ({
    ...value,
    description: value.description || null,
    startTime: serializeLocalDateTime(value.startTime),
    endTime: serializeLocalDateTime(value.endTime),
  }));

export type ChallengeFormInput = z.input<typeof challengeFormSchema>;

const optionFormSchema = z.object({
  optionText: z.string().trim().min(1, "Teks opsi wajib diisi").max(500, "Opsi maksimal 500 karakter"),
  isCorrect: z.boolean(),
  sortOrder: nonNegativeInteger("Urutan opsi"),
});

export const questionFormSchema = z
  .object({
    questionType: z.enum(["pilihan_ganda", "isian_singkat", "esai"]),
    questionText: z.string().trim().min(1, "Pertanyaan wajib diisi"),
    points: nonNegativeInteger("Poin"),
    sortOrder: nonNegativeInteger("Urutan"),
    timeLimitSeconds: positiveNullableInteger("Batas waktu"),
    correctAnswerText: z.string().trim().max(500, "Jawaban maksimal 500 karakter"),
    options: z.array(optionFormSchema),
  })
  .superRefine((value, context) => {
    if (value.questionType === "pilihan_ganda") {
      if (value.options.length < 2) {
        context.addIssue({ code: "custom", path: ["options"], message: "Minimal dua opsi jawaban" });
      }
      if (value.options.filter((option) => option.isCorrect).length !== 1) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message: "Pilih tepat satu jawaban benar",
        });
      }
    }

    if (value.questionType === "isian_singkat" && !value.correctAnswerText) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswerText"],
        message: "Jawaban benar wajib diisi",
      });
    }

    if (value.questionType === "esai" && value.correctAnswerText) {
      context.addIssue({
        code: "custom",
        path: ["correctAnswerText"],
        message: "Esai tidak menggunakan jawaban benar otomatis",
      });
    }
  })
  .transform((value) => ({
    ...value,
    correctAnswerText: value.questionType === "isian_singkat" ? value.correctAnswerText : null,
    options: value.questionType === "pilihan_ganda" ? value.options : undefined,
  }));

export type QuestionFormInput = z.input<typeof questionFormSchema>;

export function firstZodFieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    result[key] ??= issue.message;
  }
  return result;
}
