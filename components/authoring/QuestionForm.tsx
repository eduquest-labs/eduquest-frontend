"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Plus, Trash2 } from "lucide-react";
import { Alert, Button, FieldError, Form, Input, Label, TextArea, TextField } from "@heroui/react";

import { firstZodFieldErrors, questionFormSchema } from "@/lib/authoring-validations";
import type { Question, QuestionInput, QuestionType } from "@/types";

export interface QuestionFormProps {
  question?: Question;
  isPublished: boolean;
  isPending: boolean;
  onSubmit: (input: QuestionInput) => Promise<void>;
  formId?: string;
  hideSubmitButton?: boolean;
}

function emptyOptions() {
  return [
    { optionText: "", isCorrect: true, sortOrder: "0" },
    { optionText: "", isCorrect: false, sortOrder: "1" },
  ];
}

export function QuestionForm({ question, isPublished, isPending, onSubmit, formId, hideSubmitButton }: QuestionFormProps) {
  const [values, setValues] = useState({
    questionType: question?.questionType ?? ("pilihan_ganda" as QuestionType),
    questionText: question?.questionText ?? "",
    points: String(question?.points ?? 10),
    sortOrder: String(question?.sortOrder ?? 0),
    timeLimitSeconds: question?.timeLimitSeconds == null ? "" : String(question.timeLimitSeconds),
    correctAnswerText: question?.correctAnswerText ?? "",
    options: question?.options.length
      ? question.options.map((option) => ({
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          sortOrder: String(option.sortOrder),
        }))
      : emptyOptions(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = questionFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstZodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setFormError(error.response.data?.message ?? "Soal published tidak dapat diubah pada bagian tersebut.");
        return;
      }
      if (isAxiosError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data?.errors ?? {};
        setErrors({
          questionType: apiErrors.question_type?.[0],
          questionText: apiErrors.question_text?.[0],
          points: apiErrors.points?.[0],
          sortOrder: apiErrors.sort_order?.[0],
          timeLimitSeconds: apiErrors.time_limit_seconds?.[0],
          correctAnswerText: apiErrors.correct_answer_text?.[0],
          options: apiErrors.options?.[0] ?? apiErrors["options.0.is_correct"]?.[0],
        });
        return;
      }
      setFormError("Soal gagal disimpan. Silakan coba lagi.");
    }
  }

  function changeType(questionType: QuestionType) {
    setValues((old) => ({
      ...old,
      questionType,
      correctAnswerText: questionType === "isian_singkat" ? old.correctAnswerText : "",
      options: questionType === "pilihan_ganda" ? (old.options.length < 2 ? emptyOptions() : old.options) : [],
    }));
  }

  return (
    <Form id={formId} className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {isPublished ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>
              Soal sudah dipublikasikan. Tipe, opsi, urutan, dan batas waktu dikunci; koreksi isi akan dicatat dalam audit revision.
            </Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}
      {formError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content></Alert>
      ) : null}

      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Tipe soal
        <select
          value={values.questionType}
          disabled={isPending || isPublished}
          onChange={(event) => changeType(event.target.value as QuestionType)}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 disabled:opacity-60 dark:border-white/15 dark:bg-black"
        >
          <option value="pilihan_ganda">Pilihan ganda</option>
          <option value="isian_singkat">Isian singkat</option>
          <option value="esai">Esai</option>
        </select>
        {errors.questionType ? <span className="text-xs text-danger">{errors.questionType}</span> : null}
      </label>

      <TextField isInvalid={Boolean(errors.questionText)} isDisabled={isPending} value={values.questionText} onChange={(value) => setValues((old) => ({ ...old, questionText: value }))}>
        <Label>Pertanyaan</Label>
        <TextArea rows={4} />
        {errors.questionText ? <FieldError>{errors.questionText}</FieldError> : null}
      </TextField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField isInvalid={Boolean(errors.points)} isDisabled={isPending} value={values.points} onChange={(value) => setValues((old) => ({ ...old, points: value }))}>
          <Label>Poin</Label>
          <Input type="number" min={0} />
          {errors.points ? <FieldError>{errors.points}</FieldError> : null}
        </TextField>
        <TextField isInvalid={Boolean(errors.sortOrder)} isDisabled={isPending || isPublished} value={values.sortOrder} onChange={(value) => setValues((old) => ({ ...old, sortOrder: value }))}>
          <Label>Urutan</Label>
          <Input type="number" min={0} />
          {errors.sortOrder ? <FieldError>{errors.sortOrder}</FieldError> : null}
        </TextField>
        <TextField isInvalid={Boolean(errors.timeLimitSeconds)} isDisabled={isPending || isPublished} value={values.timeLimitSeconds} onChange={(value) => setValues((old) => ({ ...old, timeLimitSeconds: value }))}>
          <Label>Batas waktu (detik)</Label>
          <Input type="number" min={1} />
          {errors.timeLimitSeconds ? <FieldError>{errors.timeLimitSeconds}</FieldError> : null}
        </TextField>
      </div>

      {values.questionType === "isian_singkat" ? (
        <TextField isInvalid={Boolean(errors.correctAnswerText)} isDisabled={isPending} value={values.correctAnswerText} onChange={(value) => setValues((old) => ({ ...old, correctAnswerText: value }))}>
          <Label>Jawaban benar</Label>
          <Input />
          {errors.correctAnswerText ? <FieldError>{errors.correctAnswerText}</FieldError> : null}
        </TextField>
      ) : null}

      {values.questionType === "pilihan_ganda" ? (
        <fieldset className="flex flex-col gap-3" disabled={isPending || isPublished}>
          <div className="flex items-center justify-between gap-3">
            <legend className="text-sm font-semibold text-slate-900 dark:text-white">Opsi jawaban</legend>
            {!isPublished ? (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onPress={() => setValues((old) => ({
                  ...old,
                  options: [...old.options, { optionText: "", isCorrect: false, sortOrder: String(old.options.length) }],
                }))}
              >
                <Plus size={14} /> Tambah opsi
              </Button>
            ) : null}
          </div>
          {values.options.map((option, index) => (
            <div key={index} className="grid grid-cols-[auto_1fr_auto] items-start gap-2 rounded-lg border border-slate-200 p-3 dark:border-white/10">
              <input
                type="radio"
                name="correct-option"
                aria-label={`Jadikan opsi ${index + 1} jawaban benar`}
                checked={option.isCorrect}
                onChange={() => setValues((old) => ({
                  ...old,
                  options: old.options.map((item, itemIndex) => ({ ...item, isCorrect: itemIndex === index })),
                }))}
                className="mt-3 accent-teal-600"
              />
              <Input
                aria-label={`Teks opsi ${index + 1}`}
                value={option.optionText}
                onChange={(event) => {
                  const optionText = event.currentTarget.value;
                  setValues((old) => ({
                    ...old,
                    options: old.options.map((item, itemIndex) => itemIndex === index ? { ...item, optionText } : item),
                  }));
                }}
              />
              {!isPublished ? (
                <button
                  type="button"
                  aria-label={`Hapus opsi ${index + 1}`}
                  disabled={values.options.length <= 2}
                  onClick={() => setValues((old) => ({ ...old, options: old.options.filter((_, itemIndex) => itemIndex !== index) }))}
                  className="flex size-10 items-center justify-center rounded-lg text-slate-400 hover:bg-danger-soft hover:text-danger disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              ) : <span />}
            </div>
          ))}
          {errors.options ? <span className="text-xs text-danger">{errors.options}</span> : null}
        </fieldset>
      ) : null}

      {!hideSubmitButton ? (
        <Button type="submit" isPending={isPending} isDisabled={isPending} className="bg-teal-600 text-white hover:bg-teal-700">
          {question ? "Simpan perubahan" : "Tambah soal"}
        </Button>
      ) : null}
    </Form>
  );
}
