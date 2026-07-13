"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { Alert, Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";

import { studentSchema } from "@/lib/validations";
import type { StudentFormValues } from "@/lib/validations";

export interface StudentFormProps {
  initialValues?: StudentFormValues;
  submitLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onSubmit: (values: StudentFormValues) => Promise<void>;
}

type FieldErrors = Partial<Record<keyof StudentFormValues, string>>;
type FormAlert = { message: string } | null;

export function StudentForm({
  initialValues,
  submitLabel,
  pendingLabel,
  isPending,
  onSubmit,
}: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(initialValues ?? { name: "", nis: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = studentSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ name: errors.name?.[0], nis: errors.nis?.[0] });
      return;
    }
    setFieldErrors({});

    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({
          name: error.response.data?.errors?.name?.[0],
          nis: error.response.data?.errors?.nis?.[0],
        });
        return;
      }
      setFormAlert({ message: "Gagal menyimpan data siswa. Silakan coba lagi." });
    }
  }

  return (
    <Form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
      {formAlert ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{formAlert.message}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <TextField
        name="name"
        value={values.name}
        onChange={(value) => setValues((prev) => ({ ...prev, name: value }))}
        isInvalid={Boolean(fieldErrors.name)}
        isDisabled={isPending}
      >
        <Label>Nama Siswa</Label>
        <Input fullWidth placeholder="Contoh: Budi Santoso" />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <TextField
        name="nis"
        value={values.nis}
        onChange={(value) => setValues((prev) => ({ ...prev, nis: value }))}
        isInvalid={Boolean(fieldErrors.nis)}
        isDisabled={isPending}
      >
        <Label>NIS</Label>
        <Input fullWidth placeholder="Contoh: 2001" />
        {fieldErrors.nis ? <FieldError>{fieldErrors.nis}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={isPending}
        isDisabled={isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending: pending }) => (pending ? pendingLabel : submitLabel)}
      </Button>
    </Form>
  );
}
