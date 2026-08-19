"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

import { Alert, Button, FieldError, Form, Input, Label, TextField, toast } from "@heroui/react";

import { useReactivateGuru } from "@/hooks/mutations";
import { reactivateGuruSchema } from "@/lib/validations";
import type { ReactivateGuruFormValues } from "@/lib/validations";

export interface ReactivateGuruFormProps {
  guruId: number;
  onReactivated: () => void;
}

type FieldErrors = Partial<Record<keyof ReactivateGuruFormValues, string>>;
type FormAlert = { message: string } | null;

export function ReactivateGuruForm({ guruId, onReactivated }: ReactivateGuruFormProps) {
  const [values, setValues] = useState<ReactivateGuruFormValues>({
    password: "",
    passwordConfirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const reactivateGuru = useReactivateGuru();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = reactivateGuruSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        password: errors.password?.[0],
        passwordConfirmation: errors.passwordConfirmation?.[0],
      });
      return;
    }
    setFieldErrors({});

    try {
      await reactivateGuru.mutateAsync({ id: guruId, password: parsed.data.password });
      toast.success("Akun guru berhasil diaktifkan kembali.");
      onReactivated();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFormAlert({ message: "Akun ini sudah aktif." });
        return;
      }
      setFormAlert({ message: "Gagal mengaktifkan akun. Silakan coba lagi." });
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

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Sampaikan kata sandi baru ini ke guru di luar sistem (chat/telepon) setelah aktivasi berhasil.
      </p>

      <TextField
        name="password"
        type="password"
        value={values.password}
        onChange={(value) => setValues((current) => ({ ...current, password: value }))}
        isInvalid={Boolean(fieldErrors.password)}
        isDisabled={reactivateGuru.isPending}
      >
        <Label>Kata Sandi Baru</Label>
        <Input fullWidth placeholder="Minimal 8 karakter" autoComplete="new-password" />
        {fieldErrors.password ? <FieldError>{fieldErrors.password}</FieldError> : null}
      </TextField>

      <TextField
        name="passwordConfirmation"
        type="password"
        value={values.passwordConfirmation}
        onChange={(value) => setValues((current) => ({ ...current, passwordConfirmation: value }))}
        isInvalid={Boolean(fieldErrors.passwordConfirmation)}
        isDisabled={reactivateGuru.isPending}
      >
        <Label>Ulangi Kata Sandi Baru</Label>
        <Input fullWidth autoComplete="new-password" />
        {fieldErrors.passwordConfirmation ? (
          <FieldError>{fieldErrors.passwordConfirmation}</FieldError>
        ) : null}
      </TextField>

      <Button
        type="submit"
        isPending={reactivateGuru.isPending}
        isDisabled={reactivateGuru.isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending }) => (isPending ? "Mengaktifkan..." : "Aktifkan Akun")}
      </Button>
    </Form>
  );
}
