"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Alert, Button, FieldError, Form, Input, Label, TextArea, TextField, toast } from "@heroui/react";

import { useGradeEssay } from "@/hooks/mutations";
import { essayGradeSchema } from "@/lib/attempt-validations";
import { firstZodFieldErrors } from "@/lib/authoring-validations";
import type { AttemptAnswer, AttemptQuestion } from "@/types";

interface EssayGradeFormProps {
  classId: number;
  attemptId: number;
  question: AttemptQuestion;
  answer: AttemptAnswer;
}

export function EssayGradeForm({ classId, attemptId, question, answer }: EssayGradeFormProps) {
  const gradeEssay = useGradeEssay(classId, attemptId, answer.id);
  const [scoreAwarded, setScoreAwarded] = useState(
    answer.scoreAwarded === null ? "" : String(answer.scoreAwarded)
  );
  const [feedback, setFeedback] = useState(answer.feedback ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [hasGrade, setHasGrade] = useState(Boolean(answer.gradedAt));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = essayGradeSchema(question.points).safeParse({ scoreAwarded, feedback });

    if (!parsed.success) {
      setErrors(firstZodFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    try {
      const result = await gradeEssay.mutateAsync(parsed.data);
      setScoreAwarded(String(result.answer.scoreAwarded));
      setFeedback(result.answer.feedback ?? "");
      setHasGrade(true);
      toast.success(
        result.attempt.gradingStatus === "complete"
          ? "Semua esai selesai dinilai."
          : "Nilai esai berhasil disimpan."
      );
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data?.errors ?? {};
        setErrors({
          scoreAwarded: apiErrors.score_awarded?.[0],
          feedback: apiErrors.feedback?.[0],
        });
        setFormError(apiErrors.answer?.[0] ?? null);
        return;
      }

      setFormError(
        isAxiosError(error) && error.response?.status === 409
          ? error.response.data?.message ?? "Attempt belum dapat dinilai."
          : "Nilai gagal disimpan. Silakan coba lagi."
      );
    }
  }

  return (
    <Form className="flex flex-col gap-4" validationBehavior="aria" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content>
        </Alert>
      ) : null}

      <TextField
        isRequired
        isInvalid={Boolean(errors.scoreAwarded)}
        name="score_awarded"
        type="number"
        value={scoreAwarded}
        onChange={setScoreAwarded}
      >
        <Label>Skor (maksimal {question.points})</Label>
        <Input min={0} max={question.points} step={1} />
        {errors.scoreAwarded ? <FieldError>{errors.scoreAwarded}</FieldError> : null}
      </TextField>

      <TextField
        isInvalid={Boolean(errors.feedback)}
        name="feedback"
        value={feedback}
        onChange={setFeedback}
      >
        <Label>Feedback (opsional)</Label>
        <TextArea rows={4} placeholder="Berikan catatan yang membantu siswa memahami hasil penilaiannya." />
        {errors.feedback ? <FieldError>{errors.feedback}</FieldError> : null}
      </TextField>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          isPending={gradeEssay.isPending}
          isDisabled={gradeEssay.isPending}
          className="bg-teal-600 text-white hover:bg-teal-700"
        >
          {hasGrade ? "Perbarui nilai" : "Simpan nilai"}
        </Button>
        {answer.gradedAt ? (
          <span className="text-xs text-slate-500">
            Terakhir dinilai {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "Asia/Jakarta",
            }).format(new Date(answer.gradedAt))}
          </span>
        ) : null}
      </div>
    </Form>
  );
}
