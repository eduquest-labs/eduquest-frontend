"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";

import {
  Alert,
  Button,
  ComboBox,
  FieldError,
  Form,
  Input,
  Label,
  ListBox,
  TextField,
} from "@heroui/react";

import { useSchools } from "@/hooks/queries";
import { registerGuruSchema } from "@/lib/validations";
import type { RegisterGuruCredentials } from "@/types";

type FieldErrors = Partial<Record<keyof RegisterGuruCredentials, string>>;

interface RegisterGuruFormProps {
  onRegistered: () => void;
}

export function RegisterGuruForm({ onRegistered }: RegisterGuruFormProps) {
  const schools = useSchools();
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    schoolId: null as number | null,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [alert, setAlert] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function updateValue<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlert(null);

    const parsed = registerGuruSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: errors.name?.[0],
        email: errors.email?.[0],
        password: errors.password?.[0],
        passwordConfirmation: errors.passwordConfirmation?.[0],
        schoolId: errors.schoolId?.[0],
      });
      return;
    }
    setFieldErrors({});

    setIsPending(true);
    const result = await signIn("register-guru", { ...parsed.data, redirect: false });
    setIsPending(false);

    if (!result || result.error) {
      if (result?.code === "rate_limited") {
        setAlert("Terlalu banyak percobaan. Coba lagi dalam beberapa menit.");
      } else {
        setAlert("Registrasi gagal. Periksa kembali data Anda, termasuk apakah email sudah terdaftar.");
      }
      return;
    }

    onRegistered();
  }

  return (
    <Form onSubmit={handleSubmit} validationBehavior="aria" className="flex w-full flex-col gap-4">
      {alert ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{alert}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <TextField
        name="name"
        value={values.name}
        onChange={(value) => updateValue("name", value)}
        isInvalid={Boolean(fieldErrors.name)}
        isDisabled={isPending}
      >
        <Label>Nama</Label>
        <Input fullWidth placeholder="Nama lengkap" autoComplete="name" />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <TextField
        name="email"
        type="email"
        value={values.email}
        onChange={(value) => updateValue("email", value)}
        isInvalid={Boolean(fieldErrors.email)}
        isDisabled={isPending}
      >
        <Label>Email</Label>
        <Input fullWidth placeholder="nama@email.com" autoComplete="email" />
        {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
      </TextField>

      <ComboBox
        selectedKey={values.schoolId}
        onSelectionChange={(key) => updateValue("schoolId", key === null ? null : Number(key))}
        isInvalid={Boolean(fieldErrors.schoolId)}
        isDisabled={isPending || schools.isLoading}
      >
        <Label>Sekolah</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Cari sekolah..." />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            {(schools.data ?? []).map((school) => (
              <ListBox.Item key={school.id} id={school.id} textValue={school.name}>
                {school.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
        {fieldErrors.schoolId ? <FieldError>{fieldErrors.schoolId}</FieldError> : null}
      </ComboBox>

      <TextField
        name="password"
        type={showPassword ? "text" : "password"}
        value={values.password}
        onChange={(value) => updateValue("password", value)}
        isInvalid={Boolean(fieldErrors.password)}
        isDisabled={isPending}
      >
        <Label>Buat kata sandi</Label>
        <div className="relative w-full">
          <Input fullWidth className="pr-10" placeholder="Minimal 8 karakter" autoComplete="new-password" />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
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
        <Label>Ulangi kata sandi</Label>
        <Input fullWidth placeholder="Ulangi kata sandi" autoComplete="new-password" />
        {fieldErrors.passwordConfirmation ? (
          <FieldError>{fieldErrors.passwordConfirmation}</FieldError>
        ) : null}
      </TextField>

      <Button
        type="submit"
        isPending={isPending}
        isDisabled={isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending: pending }) => (pending ? "Mendaftarkan..." : "Daftar")}
      </Button>
    </Form>
  );
}
