"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { Alert, Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";

import { useCreateClass } from "@/hooks/mutations";
import { createClassSchema } from "@/lib/validations";
import type { CreateClassFormValues } from "@/lib/validations";

export interface CreateClassFormProps {
  onCreated: (newClass: { id: number }) => void;
}

type FieldErrors = Partial<Record<keyof CreateClassFormValues, string>>;
type FormAlert = { message: string } | null;

export function CreateClassForm({ onCreated }: CreateClassFormProps) {
  const [values, setValues] = useState<CreateClassFormValues>({ name: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const createClass = useCreateClass();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = createClassSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ name: errors.name?.[0] });
      return;
    }
    setFieldErrors({});

    try {
      const newClass = await createClass.mutateAsync(parsed.data);
      onCreated(newClass);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({ name: error.response.data?.errors?.name?.[0] });
        return;
      }
      setFormAlert({ message: "Gagal membuat kelas. Silakan coba lagi." });
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
        onChange={(value) => setValues({ name: value })}
        isInvalid={Boolean(fieldErrors.name)}
        isDisabled={createClass.isPending}
      >
        <Label>Nama Kelas</Label>
        <Input fullWidth placeholder="Contoh: SMA Negeri 1 Bandung" />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={createClass.isPending}
        isDisabled={createClass.isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending }) => (isPending ? "Membuat..." : "Buat Kelas")}
      </Button>
    </Form>
  );
}
