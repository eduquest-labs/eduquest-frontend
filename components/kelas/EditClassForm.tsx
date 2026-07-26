"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { Alert, Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";

import { useUpdateClass } from "@/hooks/mutations";
import { createClassSchema } from "@/lib/validations";
import type { CreateClassFormValues } from "@/lib/validations";

export interface EditClassFormProps {
  classId: number;
  currentName: string;
  onUpdated: () => void;
}

type FieldErrors = Partial<Record<keyof CreateClassFormValues, string>>;
type FormAlert = { message: string } | null;

export function EditClassForm({ classId, currentName, onUpdated }: EditClassFormProps) {
  const [values, setValues] = useState<CreateClassFormValues>({ name: currentName });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const updateClass = useUpdateClass(classId);

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
      await updateClass.mutateAsync(parsed.data);
      toast.success(`Kelas "${parsed.data.name}" berhasil diperbarui.`);
      onUpdated();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({ name: error.response.data?.errors?.name?.[0] });
        return;
      }
      setFormAlert({ message: "Gagal memperbarui kelas. Silakan coba lagi." });
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
        isDisabled={updateClass.isPending}
      >
        <Label>Nama Kelas</Label>
        <Input fullWidth placeholder="Contoh: SMA Negeri 1 Bandung" />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={updateClass.isPending}
        isDisabled={updateClass.isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending }) => (isPending ? "Menyimpan..." : "Simpan Perubahan")}
      </Button>
    </Form>
  );
}
