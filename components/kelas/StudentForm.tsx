"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import {
  Alert,
  Button,
  FieldError,
  Form,
  Input,
  Label,
  Radio,
  RadioGroup,
  TextField,
} from "@heroui/react";

import { studentSchema } from "@/lib/validations";
import type { StudentFormValues } from "@/lib/validations";

type StudentFormDraft = Omit<StudentFormValues, "jenisKelamin"> & {
  jenisKelamin: StudentFormValues["jenisKelamin"] | undefined;
};

export interface StudentFormProps {
  initialValues?: StudentFormDraft;
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
  const [values, setValues] = useState<StudentFormDraft>(
    initialValues ?? { name: "", nisn: "", jenisKelamin: undefined }
  );
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = studentSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        nisn: errors.nisn?.[0],
        jenisKelamin: errors.jenisKelamin?.[0],
      });
      return;
    }
    setFieldErrors({});

    try {
      await onSubmit(parsed.data);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({
          name: error.response.data?.errors?.name?.[0],
          nisn: error.response.data?.errors?.nisn?.[0],
          jenisKelamin: error.response.data?.errors?.jenis_kelamin?.[0],
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
        name="nisn"
        value={values.nisn}
        onChange={(value) => setValues((prev) => ({ ...prev, nisn: value.replace(/\D/g, "").slice(0, 10) }))}
        isInvalid={Boolean(fieldErrors.nisn)}
        isDisabled={isPending}
      >
        <Label>NISN</Label>
        <Input fullWidth inputMode="numeric" placeholder="Contoh: 0012345678" />
        {fieldErrors.nisn ? <FieldError>{fieldErrors.nisn}</FieldError> : null}
      </TextField>

      <RadioGroup
        value={values.jenisKelamin}
        onChange={(value) =>
          setValues((prev) => ({
            ...prev,
            jenisKelamin: value as StudentFormDraft["jenisKelamin"],
          }))
        }
        orientation="horizontal"
        isInvalid={Boolean(fieldErrors.jenisKelamin)}
        isDisabled={isPending}
      >
        <Label>Jenis Kelamin</Label>
        <Radio value="L">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            Laki-laki
          </Radio.Content>
        </Radio>
        <Radio value="P">
          <Radio.Content>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            Perempuan
          </Radio.Content>
        </Radio>
        {fieldErrors.jenisKelamin ? <FieldError>{fieldErrors.jenisKelamin}</FieldError> : null}
      </RadioGroup>

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
