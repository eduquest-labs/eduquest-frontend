"use client";

import { useState } from "react";
import { isAxiosError } from "axios";

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
  toast,
} from "@heroui/react";

import { useUpdateGuru } from "@/hooks/mutations";
import { useSchools } from "@/hooks/queries";

export interface EditGuruFormProps {
  guru: { id: number; name: string; email: string; schoolId: number };
  onUpdated: () => void;
}

type FieldErrors = { name?: string; email?: string; schoolId?: string };
type FormAlert = { message: string } | null;

export function EditGuruForm({ guru, onUpdated }: EditGuruFormProps) {
  const schools = useSchools();
  const [values, setValues] = useState({
    name: guru.name,
    email: guru.email,
    schoolId: guru.schoolId as number | null,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formAlert, setFormAlert] = useState<FormAlert>(null);
  const updateGuru = useUpdateGuru();

  function updateValue<K extends keyof typeof values>(key: K, value: (typeof values)[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormAlert(null);

    if (!values.name.trim()) {
      setFieldErrors({ name: "Nama wajib diisi" });
      return;
    }
    if (!values.email.trim()) {
      setFieldErrors({ email: "Email wajib diisi" });
      return;
    }
    if (values.schoolId === null) {
      setFieldErrors({ schoolId: "Sekolah wajib dipilih" });
      return;
    }
    setFieldErrors({});

    try {
      await updateGuru.mutateAsync({
        id: guru.id,
        name: values.name,
        email: values.email,
        schoolId: values.schoolId,
      });
      toast.success(`Data guru "${values.name}" berhasil diperbarui.`);
      onUpdated();
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        const errors = error.response.data?.errors ?? {};
        setFieldErrors({
          name: errors.name?.[0],
          email: errors.email?.[0],
          schoolId: errors.school_id?.[0],
        });
        return;
      }
      setFormAlert({ message: "Gagal memperbarui data guru. Silakan coba lagi." });
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
        onChange={(value) => updateValue("name", value)}
        isInvalid={Boolean(fieldErrors.name)}
        isDisabled={updateGuru.isPending}
      >
        <Label>Nama</Label>
        <Input fullWidth />
        {fieldErrors.name ? <FieldError>{fieldErrors.name}</FieldError> : null}
      </TextField>

      <TextField
        name="email"
        type="email"
        value={values.email}
        onChange={(value) => updateValue("email", value)}
        isInvalid={Boolean(fieldErrors.email)}
        isDisabled={updateGuru.isPending}
      >
        <Label>Email</Label>
        <Input fullWidth />
        {fieldErrors.email ? <FieldError>{fieldErrors.email}</FieldError> : null}
      </TextField>

      <ComboBox
        selectedKey={values.schoolId}
        onSelectionChange={(key) => updateValue("schoolId", key === null ? null : Number(key))}
        isInvalid={Boolean(fieldErrors.schoolId)}
        isDisabled={updateGuru.isPending || schools.isLoading}
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

      <Button
        type="submit"
        isPending={updateGuru.isPending}
        isDisabled={updateGuru.isPending}
        fullWidth
        className="bg-teal-600 text-white hover:bg-teal-700 data-[pressed=true]:bg-teal-800"
      >
        {({ isPending }) => (isPending ? "Menyimpan..." : "Simpan Perubahan")}
      </Button>
    </Form>
  );
}
