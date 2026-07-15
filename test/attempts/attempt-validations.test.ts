import { describe, expect, it } from "vitest";

import { attemptAnswerSchema, remainingAttemptSeconds } from "@/lib/attempt-validations";

describe("attempt answer validation", () => {
  it("mewajibkan opsi untuk pilihan ganda", () => {
    expect(attemptAnswerSchema.safeParse({ questionType: "pilihan_ganda", selectedOptionId: null, answerText: "", attachment: null }).success).toBe(false);
    expect(attemptAnswerSchema.safeParse({ questionType: "pilihan_ganda", selectedOptionId: 2, answerText: "", attachment: null }).success).toBe(true);
  });

  it("mewajibkan teks untuk isian singkat", () => {
    expect(attemptAnswerSchema.safeParse({ questionType: "isian_singkat", selectedOptionId: null, answerText: "  ", attachment: null }).success).toBe(false);
  });

  it("menerima esai berupa teks atau attachment", () => {
    expect(attemptAnswerSchema.safeParse({ questionType: "esai", selectedOptionId: null, answerText: "", attachment: null }).success).toBe(false);
    expect(attemptAnswerSchema.safeParse({ questionType: "esai", selectedOptionId: null, answerText: "Uraian", attachment: null }).success).toBe(true);
  });

  it("menghitung sisa waktu dari timestamp absolut", () => {
    expect(remainingAttemptSeconds("2026-07-20T08:01:00+07:00", new Date("2026-07-20T08:00:30+07:00").getTime())).toBe(30);
    expect(remainingAttemptSeconds("2026-07-20T08:00:00+07:00", new Date("2026-07-20T08:00:01+07:00").getTime())).toBe(0);
    expect(remainingAttemptSeconds(null, Date.now())).toBeNull();
  });
});
