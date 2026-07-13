"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Alert, Button, FieldError, Form, Input, Label, TextArea, TextField } from "@heroui/react";

import {
  challengeFormSchema,
  firstZodFieldErrors,
  toDateTimeLocal,
} from "@/lib/authoring-validations";
import type { Challenge, ChallengeInput, ChallengeType } from "@/types";

export interface ChallengeFormProps {
  challenge?: Challenge;
  isPending: boolean;
  onSubmit: (input: ChallengeInput) => Promise<void>;
}

export function ChallengeForm({ challenge, isPending, onSubmit }: ChallengeFormProps) {
  const [values, setValues] = useState({
    title: challenge?.title ?? "",
    description: challenge?.description ?? "",
    type: challenge?.type ?? ("kuis" as ChallengeType),
    pointsReward: String(challenge?.pointsReward ?? 0),
    startTime: toDateTimeLocal(challenge?.startTime ?? null),
    endTime: toDateTimeLocal(challenge?.endTime ?? null),
    timerSeconds: challenge?.timerSeconds == null ? "" : String(challenge.timerSeconds),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = challengeFormSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstZodFieldErrors(parsed.error));
      return;
    }
    setErrors({});
    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        const apiErrors = error.response.data?.errors ?? {};
        setErrors({
          title: apiErrors.title?.[0],
          description: apiErrors.description?.[0],
          type: apiErrors.type?.[0],
          pointsReward: apiErrors.points_reward?.[0],
          startTime: apiErrors.start_time?.[0],
          endTime: apiErrors.end_time?.[0],
          timerSeconds: apiErrors.timer_seconds?.[0],
        });
        return;
      }
      setFormError("Challenge gagal disimpan. Silakan coba lagi.");
    }
  }

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content></Alert>
      ) : null}
      <TextField isInvalid={Boolean(errors.title)} isDisabled={isPending} value={values.title} onChange={(value) => setValues((old) => ({ ...old, title: value }))}>
        <Label>Judul challenge</Label>
        <Input />
        {errors.title ? <FieldError>{errors.title}</FieldError> : null}
      </TextField>
      <TextField isInvalid={Boolean(errors.description)} isDisabled={isPending} value={values.description} onChange={(value) => setValues((old) => ({ ...old, description: value }))}>
        <Label>Deskripsi</Label>
        <TextArea rows={3} />
        {errors.description ? <FieldError>{errors.description}</FieldError> : null}
      </TextField>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
        Tipe
        <select
          value={values.type}
          disabled={isPending}
          onChange={(event) => setValues((old) => ({ ...old, type: event.target.value as ChallengeType }))}
          className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 dark:border-white/15 dark:bg-black"
        >
          <option value="kuis">Kuis</option>
          <option value="aktivitas_fisik">Aktivitas fisik</option>
        </select>
        {errors.type ? <span className="text-xs text-danger">{errors.type}</span> : null}
      </label>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField isInvalid={Boolean(errors.pointsReward)} isDisabled={isPending} value={values.pointsReward} onChange={(value) => setValues((old) => ({ ...old, pointsReward: value }))}>
          <Label>Reward poin</Label>
          <Input type="number" min={0} />
          {errors.pointsReward ? <FieldError>{errors.pointsReward}</FieldError> : null}
        </TextField>
        <TextField isInvalid={Boolean(errors.timerSeconds)} isDisabled={isPending} value={values.timerSeconds} onChange={(value) => setValues((old) => ({ ...old, timerSeconds: value }))}>
          <Label>Timer (detik, opsional)</Label>
          <Input type="number" min={1} />
          {errors.timerSeconds ? <FieldError>{errors.timerSeconds}</FieldError> : null}
        </TextField>
        <TextField isInvalid={Boolean(errors.startTime)} isDisabled={isPending} value={values.startTime} onChange={(value) => setValues((old) => ({ ...old, startTime: value }))}>
          <Label>Mulai (opsional)</Label>
          <Input type="datetime-local" />
          {errors.startTime ? <FieldError>{errors.startTime}</FieldError> : null}
        </TextField>
        <TextField isInvalid={Boolean(errors.endTime)} isDisabled={isPending} value={values.endTime} onChange={(value) => setValues((old) => ({ ...old, endTime: value }))}>
          <Label>Selesai (opsional)</Label>
          <Input type="datetime-local" />
          {errors.endTime ? <FieldError>{errors.endTime}</FieldError> : null}
        </TextField>
      </div>
      <Button type="submit" isPending={isPending} isDisabled={isPending} className="bg-teal-600 text-white hover:bg-teal-700">
        {challenge ? "Simpan perubahan" : "Buat challenge"}
      </Button>
    </Form>
  );
}
