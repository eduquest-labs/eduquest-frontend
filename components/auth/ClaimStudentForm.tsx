"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

import { Alert, Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";

import { claimStudentSchema } from "@/lib/validations";
import type { ClaimStudentCredentials } from "@/types";

type FieldErrors = Partial<Record<keyof ClaimStudentCredentials, string>>;
type FormAlert = { message: string } | null;

interface ClaimStudentFormProps {
  onClaimed: (anonymousId: string) => void;
}

export function ClaimStudentForm({ onClaimed }: ClaimStudentFormProps) {
  const [values, setValues] = useState<ClaimStudentCredentials>({
    classCode: "",
    nis: "",
    password: "",
    passwordConfirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateValue<K extends keyof ClaimStudentCredentials>(key: K, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = claimStudentSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        classCode: errors.classCode?.[0],
        nis: errors.nis?.[0],
        password: errors.password?.[0],
        passwordConfirmation: errors.passwordConfirmation?.[0],
      });
      return;
    }
    setFieldErrors({});

    setIsPending(true);
    const result = await signIn("claim-student", {
      classCode: parsed.data.classCode,
      nis: parsed.data.nis,
      password: parsed.data.password,
      passwordConfirmation: parsed.data.passwordConfirmation,
      redirect: false,
    });
    setIsPending(false);

    if (!result || result.error) {
      if (result?.code === "rate_limited") {
        setFormAlert({ message: "Terlalu banyak percobaan, coba lagi dalam beberapa menit." });
      } else if (result?.code === "already_claimed") {
        setFieldErrors({ nis: "Akun ini sudah pernah diaktifkan. Silakan login dengan kata sandi Anda." });
      } else {
        setFieldErrors({ nis: "Kode kelas atau NIS tidak ditemukan." });
      }
      return;
    }

    const session = await fetch("/api/auth/session").then((res) => res.json());
    const anonymousId: string | undefined = session?.user?.anonymousId;
    if (anonymousId) {
      onClaimed(anonymousId);
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
        name="classCode"
        value={values.classCode}
        onChange={(value) => updateValue("classCode", value)}
        isInvalid={Boolean(fieldErrors.classCode)}
        isDisabled={isPending}
      >
        <Label>Kode Kelas</Label>
        <Input fullWidth placeholder="Masukkan kode kelas dari dosen" />
        {fieldErrors.classCode ? <FieldError>{fieldErrors.classCode}</FieldError> : null}
      </TextField>

      <TextField
        name="nis"
        value={values.nis}
        onChange={(value) => updateValue("nis", value)}
        isInvalid={Boolean(fieldErrors.nis)}
        isDisabled={isPending}
      >
        <Label>NIS</Label>
        <Input fullWidth placeholder="Masukkan NIS Anda" />
        {fieldErrors.nis ? <FieldError>{fieldErrors.nis}</FieldError> : null}
      </TextField>

      <TextField
        name="password"
        type={showPassword ? "text" : "password"}
        value={values.password}
        onChange={(value) => updateValue("password", value)}
        isInvalid={Boolean(fieldErrors.password)}
        isDisabled={isPending}
      >
        <Label>Buat Kata Sandi</Label>
        <div className="relative w-full">
          <Input
            fullWidth
            className="pr-10"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {fieldErrors.password ? <FieldError>{fieldErrors.password}</FieldError> : null}
      </TextField>

      <TextField
        name="passwordConfirmation"
        type={showPassword ? "text" : "password"}
        value={values.passwordConfirmation}
        onChange={(value) => updateValue("passwordConfirmation", value)}
        isInvalid={Boolean(fieldErrors.passwordConfirmation)}
        isDisabled={isPending}
      >
        <Label>Ulangi Kata Sandi</Label>
        <Input fullWidth placeholder="Ulangi kata sandi" autoComplete="new-password" />
        {fieldErrors.passwordConfirmation ? <FieldError>{fieldErrors.passwordConfirmation}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={isPending}
        isDisabled={isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending: pending }) => (pending ? "Memproses..." : "Aktifkan Akun")}
      </Button>
    </Form>
  );
}
