"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Alert, Button, FieldError, Form, Input, Label, Switch, TextField, Tooltip } from "@heroui/react";

import { firstZodFieldErrors, termFormSchema, toDateTimeLocal } from "@/lib/authoring-validations";
import type { Term, TermInput } from "@/types";

export interface TermFormProps {
  term?: Term;
  isPending: boolean;
  onSubmit: (input: TermInput) => Promise<void>;
}

export function TermForm({ term, isPending, onSubmit }: TermFormProps) {
  const [values, setValues] = useState({
    name: term?.name ?? "",
    sortOrder: String(term?.sortOrder ?? 0),
    thresholdPercent: String(term?.thresholdPercent ?? 60),
    releaseAt: toDateTimeLocal(term?.releaseAt ?? null),
    randomizeQuestions: term?.randomizeQuestions ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = termFormSchema.safeParse(values);
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
          name: apiErrors.name?.[0],
          sortOrder: apiErrors.sort_order?.[0],
          thresholdPercent: apiErrors.threshold_percent?.[0],
          releaseAt: apiErrors.release_at?.[0],
        });
        return;
      }
      setFormError("Termin gagal disimpan. Silakan coba lagi.");
    }
  }

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content></Alert>
      ) : null}
      <TextField isInvalid={Boolean(errors.name)} isDisabled={isPending} value={values.name} onChange={(value) => setValues((old) => ({ ...old, name: value }))}>
        <Label>Nama termin</Label>
        <Input />
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </TextField>
      <TextField isInvalid={Boolean(errors.sortOrder)} isDisabled={isPending} value={values.sortOrder} onChange={(value) => setValues((old) => ({ ...old, sortOrder: value }))}>
        <Label>Urutan</Label>
        <Input type="number" min={0} />
        {errors.sortOrder ? <FieldError>{errors.sortOrder}</FieldError> : null}
      </TextField>
      <TextField isInvalid={Boolean(errors.thresholdPercent)} isDisabled={isPending} value={values.thresholdPercent} onChange={(value) => setValues((old) => ({ ...old, thresholdPercent: value }))}>
        <Label>Threshold kelulusan (%)</Label>
        <Input type="number" />
        {errors.thresholdPercent ? <FieldError>{errors.thresholdPercent}</FieldError> : null}
      </TextField>
      <TextField isInvalid={Boolean(errors.releaseAt)} isDisabled={isPending} value={values.releaseAt} onChange={(value) => setValues((old) => ({ ...old, releaseAt: value }))}>
        <Label>Jadwal rilis (opsional)</Label>
        <Input type="datetime-local" />
        {errors.releaseAt ? <FieldError>{errors.releaseAt}</FieldError> : null}
      </TextField>
      <Tooltip delay={0}>
        <Tooltip.Trigger aria-label="Keterangan randomisasi soal">
          <Switch isDisabled isSelected={values.randomizeQuestions}>
            <Switch.Content>
              <Switch.Control><Switch.Thumb /></Switch.Control>
              Randomisasi soal (segera hadir)
            </Switch.Content>
          </Switch>
        </Tooltip.Trigger>
        <Tooltip.Content>Fitur ini belum aktif di sistem, disiapkan untuk pembaruan mendatang.</Tooltip.Content>
      </Tooltip>
      <Button type="submit" isPending={isPending} isDisabled={isPending} className="bg-teal-600 text-white hover:bg-teal-700">
        {term ? "Simpan perubahan" : "Buat termin"}
      </Button>
    </Form>
  );
}
