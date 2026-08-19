"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { Info } from "lucide-react";
import { Alert, Button, FieldError, Form, Input, Label, TextField, Tooltip } from "@heroui/react";

import { firstZodFieldErrors, topicFormSchema } from "@/lib/authoring-validations";
import type { Topic, TopicInput } from "@/types";

export interface TopicFormProps {
  topic?: Topic;
  isPending: boolean;
  onSubmit: (input: TopicInput) => Promise<void>;
}

export function TopicForm({ topic, isPending, onSubmit }: TopicFormProps) {
  const [values, setValues] = useState({
    name: topic?.name ?? "",
    sortOrder: String(topic?.sortOrder ?? 0),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = topicFormSchema.safeParse(values);
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
        });
        return;
      }
      setFormError("Topic gagal disimpan. Silakan coba lagi.");
    }
  }

  return (
    <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{formError}</Alert.Description></Alert.Content></Alert>
      ) : null}
      <TextField isInvalid={Boolean(errors.name)} isDisabled={isPending} value={values.name} onChange={(value) => setValues((old) => ({ ...old, name: value }))}>
        <Label>Nama topic</Label>
        <Input />
        {errors.name ? <FieldError>{errors.name}</FieldError> : null}
      </TextField>
      <TextField isInvalid={Boolean(errors.sortOrder)} isDisabled={isPending} value={values.sortOrder} onChange={(value) => setValues((old) => ({ ...old, sortOrder: value }))}>
        <div className="flex items-center gap-1.5">
          <Label>Urutan</Label>
          <Tooltip delay={0}>
            <Tooltip.Trigger aria-label="Keterangan urutan topic">
              <Info size={14} className="text-slate-400" />
            </Tooltip.Trigger>
            <Tooltip.Content showArrow className="max-w-72 bg-black text-white shadow-md dark:bg-white dark:text-black">
              <Tooltip.Arrow>
                <svg viewBox="0 0 12 12" width="12" height="12" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M0 0C5.48483 8 6.5 8 12 0Z"
                    className="fill-black dark:fill-white"
                  />
                </svg>
              </Tooltip.Arrow>
              <p>Menentukan posisi topic dalam daftar. Angka lebih kecil tampil lebih dulu.</p>
            </Tooltip.Content>
          </Tooltip>
        </div>
        <Input type="number" min={0} />
        {errors.sortOrder ? <FieldError>{errors.sortOrder}</FieldError> : null}
      </TextField>
      <Button type="submit" isPending={isPending} isDisabled={isPending} className="bg-teal-600 text-white hover:bg-teal-700">
        {topic ? "Simpan perubahan" : "Buat topic"}
      </Button>
    </Form>
  );
}
