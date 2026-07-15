"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { CheckCircle2, Paperclip } from "lucide-react";
import { Alert, Button, FieldError, Form, Input, Label, TextArea, TextField } from "@heroui/react";

import { ESSAY_ATTACHMENT_ACCEPT, ESSAY_ATTACHMENT_MAX_MB } from "@/config/constants";
import { useSubmitAttemptAnswer } from "@/hooks/mutations";
import { attemptAnswerSchema } from "@/lib/attempt-validations";
import { firstZodFieldErrors } from "@/lib/authoring-validations";
import type { AttemptAnswer, AttemptQuestion } from "@/types";

interface AttemptAnswerFormProps {
  attemptId: number;
  question: AttemptQuestion;
  answer?: AttemptAnswer;
  disabled: boolean;
}

export function AttemptAnswerForm({ attemptId, question, answer, disabled }: AttemptAnswerFormProps) {
  const submitAnswer = useSubmitAttemptAnswer(attemptId);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(answer?.selectedOptionId ?? null);
  const [answerText, setAnswerText] = useState(answer?.answerText ?? "");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(Boolean(answer));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    if (attachment && attachment.size > ESSAY_ATTACHMENT_MAX_MB * 1024 * 1024) {
      setErrors({ attachment: `Ukuran lampiran maksimal ${ESSAY_ATTACHMENT_MAX_MB} MB` });
      return;
    }

    const parsed = attemptAnswerSchema.safeParse({
      questionType: question.questionType,
      selectedOptionId,
      answerText,
      attachment,
    });
    if (!parsed.success) {
      setErrors(firstZodFieldErrors(parsed.error));
      return;
    }

    setErrors({});
    try {
      await submitAnswer.mutateAsync({
        questionId: question.id,
        selectedOptionId: parsed.data.selectedOptionId,
        answerText: parsed.data.answerText.trim() || null,
        attachment: parsed.data.attachment,
      });
      setAttachment(null);
      setSaved(true);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data?.errors ?? {};
        setErrors({
          selectedOptionId: apiErrors.selected_option_id?.[0],
          answerText: apiErrors.answer_text?.[0],
          attachment: apiErrors.attachment?.[0],
        });
        return;
      }
      setFormError(
        isAxiosError(error) && error.response?.status === 409
          ? error.response.data?.message ?? "Attempt sudah tidak dapat diubah."
          : "Jawaban gagal disimpan. Silakan coba lagi."
      );
    }
  }

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content></Alert>
      ) : null}

      {question.questionType === "pilihan_ganda" ? (
        <fieldset className="flex flex-col gap-2" disabled={disabled || submitAnswer.isPending}>
          <legend className="sr-only">Pilihan jawaban</legend>
          {question.options.map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm has-checked:border-teal-600 has-checked:bg-teal-50 dark:border-white/10 dark:has-checked:bg-teal-400/5">
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={selectedOptionId === option.id}
                onChange={() => { setSelectedOptionId(option.id); setSaved(false); }}
                className="size-4 accent-teal-600"
              />
              {option.optionText}
            </label>
          ))}
          {errors.selectedOptionId ? <span className="text-xs text-danger">{errors.selectedOptionId}</span> : null}
        </fieldset>
      ) : null}

      {question.questionType === "isian_singkat" ? (
        <TextField isInvalid={Boolean(errors.answerText)} isDisabled={disabled || submitAnswer.isPending} value={answerText} onChange={(value) => { setAnswerText(value); setSaved(false); }}>
          <Label>Jawaban</Label>
          <Input maxLength={500} />
          {errors.answerText ? <FieldError>{errors.answerText}</FieldError> : null}
        </TextField>
      ) : null}

      {question.questionType === "esai" ? (
        <div className="flex flex-col gap-3">
          <TextField isInvalid={Boolean(errors.answerText)} isDisabled={disabled || submitAnswer.isPending} value={answerText} onChange={(value) => { setAnswerText(value); setSaved(false); }}>
            <Label>Jawaban esai</Label>
            <TextArea rows={5} maxLength={10000} />
            {errors.answerText ? <FieldError>{errors.answerText}</FieldError> : null}
          </TextField>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            <span className="flex items-center gap-2"><Paperclip size={15} /> Lampiran foto/video (opsional)</span>
            <input
              type="file"
              accept={ESSAY_ATTACHMENT_ACCEPT}
              disabled={disabled || submitAnswer.isPending}
              onChange={(event) => { setAttachment(event.currentTarget.files?.[0] ?? null); setSaved(false); }}
              className="rounded-lg border border-slate-300 bg-white p-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-teal-50 file:px-3 file:py-1.5 file:text-teal-700 dark:border-white/15 dark:bg-black"
            />
            <span className="text-xs text-slate-500">JPG, PNG, MP4, atau MOV. Maksimal {ESSAY_ATTACHMENT_MAX_MB} MB.</span>
            {answer?.hasAttachment && !attachment ? <span className="text-xs text-teal-700">Lampiran sebelumnya sudah tersimpan.</span> : null}
            {errors.attachment ? <span className="text-xs text-danger">{errors.attachment}</span> : null}
          </label>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" isPending={submitAnswer.isPending} isDisabled={disabled || submitAnswer.isPending} className="bg-teal-600 text-white hover:bg-teal-700">
          Simpan jawaban
        </Button>
        {saved ? <span className="flex items-center gap-1.5 text-sm text-teal-700"><CheckCircle2 size={16} /> Jawaban tersimpan</span> : null}
      </div>
    </Form>
  );
}
