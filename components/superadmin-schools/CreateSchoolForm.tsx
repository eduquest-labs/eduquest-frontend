"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { Alert, Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";

import { useCreateSchool } from "@/hooks/mutations";
import { createSchoolSchema } from "@/lib/validations";
import type { CreateSchoolFormValues } from "@/lib/validations";

export interface CreateSchoolFormProps {
  onCreated: (newSchool: { id: number; name: string }) => void;
}

type FieldErrors = Partial<Record<keyof CreateSchoolFormValues, string>>;
type FormAlert = { message: string } | null;

export function CreateSchoolForm({ onCreated }: CreateSchoolFormProps) {
  const [values, setValues] = useState<CreateSchoolFormValues>({ name: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const createSchool = useCreateSchool();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = createSchoolSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({ name: errors.name?.[0] });
      return;
    }
    setFieldErrors({});

    try {
      const newSchool = await createSchool.mutateAsync(parsed.data.name);
      toast.success(`Sekolah "${parsed.data.name}" berhasil dibuat.`);
      onCreated(newSchool);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({ name: error.response.data?.errors?.name?.[0] });
        return;
      }
      setFormAlert({ message: "Gagal membuat sekolah. Silakan coba lagi." });
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
        isDisabled={createSchool.isPending}
      >
        <Label>Nama Sekolah</Label>
        <Input fullWidth placeholder="Contoh: SMA Negeri 1 Bandung" />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={createSchool.isPending}
        isDisabled={createSchool.isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending }) => (isPending ? "Membuat..." : "Buat Sekolah")}
      </Button>
    </Form>
  );
}
