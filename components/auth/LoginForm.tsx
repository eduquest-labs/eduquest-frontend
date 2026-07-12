"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

import { Alert, Button, FieldError, Form, Input, Label, TextField } from "@heroui/react";

import { loginSchema } from "@/lib/validations";
import type { LoginCredentials } from "@/types";

type FieldErrors = Partial<Record<keyof LoginCredentials, string>>;
type FormAlert = { message: string } | null;

export function LoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginCredentials>({ identifier: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        identifier: errors.identifier?.[0],
        password: errors.password?.[0],
      });
      return;
    }
    setFieldErrors({});

    setIsPending(true);
    const result = await signIn("credentials", {
      identifier: parsed.data.identifier,
      password: parsed.data.password,
      redirect: false,
    });

    if (!result || result.error) {
      setIsPending(false);
      if (result?.code === "rate_limited") {
        setFormAlert({ message: "Terlalu banyak percobaan, coba lagi dalam beberapa menit." });
      } else {
        setFieldErrors({ identifier: "Kredensial tidak valid." });
      }
      return;
    }

    const session = await getSession();
    setIsPending(false);
    router.push(session?.user.role === "dosen" ? "/dosen" : "/siswa");
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
        name="identifier"
        value={values.identifier}
        onChange={(value) => setValues((prev) => ({ ...prev, identifier: value }))}
        isInvalid={Boolean(fieldErrors.identifier)}
        isDisabled={isPending}
      >
        <Label>Email atau ID</Label>
        <Input fullWidth placeholder="Masukkan email atau ID" autoComplete="username" />
        {fieldErrors.identifier ? <FieldError>{fieldErrors.identifier}</FieldError> : null}
      </TextField>

      <TextField
        name="password"
        type={showPassword ? "text" : "password"}
        value={values.password}
        onChange={(value) => setValues((prev) => ({ ...prev, password: value }))}
        isInvalid={Boolean(fieldErrors.password)}
        isDisabled={isPending}
      >
        <Label>Kata Sandi</Label>
        <div className="relative w-full">
          <Input
            fullWidth
            className="pr-10"
            placeholder="Masukkan kata sandi"
            autoComplete="current-password"
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

      <Button
        type="submit"
        isPending={isPending}
        isDisabled={isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending: pending }) => (pending ? "Memproses..." : "Masuk")}
      </Button>
    </Form>
  );
}
