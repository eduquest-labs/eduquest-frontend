"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

import { Alert, Button, FieldError, Form, Input, Label, ProgressBar, TextField } from "@heroui/react";

import { claimStudentSchema } from "@/lib/validations";
import type { ClaimStudentCredentials } from "@/types";

type FieldErrors = Partial<Record<keyof ClaimStudentCredentials, string>>;

interface ClaimStudentFormProps {
  onClaimed: () => void;
}

export function ClaimStudentForm({ onClaimed }: ClaimStudentFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [values, setValues] = useState<ClaimStudentCredentials>({
    classCode: "",
    nisn: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateValue<K extends keyof ClaimStudentCredentials>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  function continueToCredentials() {
    const errors: FieldErrors = {};
    if (!values.classCode.trim()) errors.classCode = "Kode kelas wajib diisi";
    if (!/^\d{10}$/.test(values.nisn.trim())) errors.nisn = "NISN harus terdiri dari tepat 10 digit";
    setFieldErrors(errors);
    if (Object.keys(errors).length === 0) setStep(2);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step === 1) {
      continueToCredentials();
      return;
    }

    setAlert(null);
    const parsed = claimStudentSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        classCode: errors.classCode?.[0],
        nisn: errors.nisn?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        passwordConfirmation: errors.passwordConfirmation?.[0],
      });
      return;
    }

    setIsPending(true);
    const result = await signIn("claim-student", { ...parsed.data, redirect: false });
    setIsPending(false);

    if (!result || result.error) {
      if (result?.code === "rate_limited") {
        setAlert("Terlalu banyak percobaan. Coba lagi dalam beberapa menit.");
      } else if (result?.code === "already_claimed") {
        setFieldErrors({ nisn: "Akun ini sudah aktif. Silakan masuk dengan NISN dan kata sandi." });
        setStep(1);
      } else {
        setFieldErrors({ nisn: "Kode kelas atau NISN tidak ditemukan." });
        setStep(1);
      }
      return;
    }

    onClaimed();
  }

  return (
    <Form onSubmit={handleSubmit} validationBehavior="aria" className="flex w-full flex-col gap-5">
      <div className="space-y-2" aria-label={`Langkah ${step} dari 2`}>
        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
          <span>Langkah {step} dari 2</span>
          <span>{step === 1 ? "Temukan akun" : "Amankan akun"}</span>
        </div>
        <ProgressBar aria-label="Progres aktivasi akun" value={step * 50}>
          <ProgressBar.Track>
            <ProgressBar.Fill className="bg-teal-600" />
          </ProgressBar.Track>
        </ProgressBar>
      </div>

      {alert ? <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>{alert}</Alert.Description></Alert.Content></Alert> : null}

      {step === 1 ? (
        <>
          <TextField name="classCode" value={values.classCode} onChange={(value) => updateValue("classCode", value.toUpperCase())} isInvalid={Boolean(fieldErrors.classCode)}>
            <Label>Kode kelas</Label>
            <Input fullWidth placeholder="Contoh: BIO-A7K2" autoComplete="off" />
            {fieldErrors.classCode ? <FieldError>{fieldErrors.classCode}</FieldError> : null}
          </TextField>
          <TextField name="nisn" value={values.nisn} onChange={(value) => updateValue("nisn", value.replace(/\D/g, "").slice(0, 10))} isInvalid={Boolean(fieldErrors.nisn)}>
            <Label>NISN</Label>
            <Input fullWidth inputMode="numeric" placeholder="10 digit NISN" autoComplete="username" />
            {fieldErrors.nisn ? <FieldError>{fieldErrors.nisn}</FieldError> : null}
          </TextField>
          <Button type="submit" fullWidth className="bg-teal-600 text-white hover:bg-teal-700">Lanjutkan</Button>
        </>
      ) : (
        <>
          <Alert status="accent"><Alert.Indicator /><Alert.Content><Alert.Description>Email dipakai untuk pemulihan identitas dan login setelah diverifikasi.</Alert.Description></Alert.Content></Alert>
          <TextField name="email" type="email" value={values.email} onChange={(value) => updateValue("email", value)} isInvalid={Boolean(fieldErrors.email)} isDisabled={isPending}>
            <Label>Email</Label>
            <Input fullWidth placeholder="nama@email.com" autoComplete="email" />
            {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
          </TextField>
          <TextField name="password" type={showPassword ? "text" : "password"} value={values.password} onChange={(value) => updateValue("password", value)} isInvalid={Boolean(fieldErrors.password)} isDisabled={isPending}>
            <Label>Buat kata sandi</Label>
            <div className="relative w-full"><Input fullWidth className="pr-10" placeholder="Minimal 8 karakter" autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
            {fieldErrors.password ? <FieldError>{fieldErrors.password}</FieldError> : null}
          </TextField>
          <TextField name="passwordConfirmation" type={showPassword ? "text" : "password"} value={values.passwordConfirmation} onChange={(value) => updateValue("passwordConfirmation", value)} isInvalid={Boolean(fieldErrors.passwordConfirmation)} isDisabled={isPending}>
            <Label>Ulangi kata sandi</Label>
            <Input fullWidth placeholder="Ulangi kata sandi" autoComplete="new-password" />
            {fieldErrors.passwordConfirmation ? <FieldError>{fieldErrors.passwordConfirmation}</FieldError> : null}
          </TextField>
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <Button type="button" variant="secondary" isDisabled={isPending} onPress={() => setStep(1)} aria-label="Kembali ke langkah pertama"><ArrowLeft size={18} /></Button>
            <Button type="submit" isPending={isPending} isDisabled={isPending} className="bg-teal-600 text-white hover:bg-teal-700">{({ isPending: pending }) => pending ? "Mengaktifkan..." : "Aktifkan akun"}</Button>
          </div>
        </>
      )}
    </Form>
  );
}
