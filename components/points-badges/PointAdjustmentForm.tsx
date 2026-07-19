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
  TextArea,
  TextField,
} from "@heroui/react";

import {
  pointAdjustmentSchema,
  type PointAdjustmentFormValues,
} from "@/lib/points-validations";
import type { PointAdjustmentInput } from "@/types";

type PointAdjustmentFormProps = {
  isPending: boolean;
  onSubmit: (input: PointAdjustmentInput) => Promise<void>;
};

type FieldErrors = Partial<Record<keyof PointAdjustmentFormValues, string>>;

export function PointAdjustmentForm({
  isPending,
  onSubmit,
}: PointAdjustmentFormProps) {
  const [values, setValues] = useState<PointAdjustmentFormValues>({
    points: "",
    reason: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const parsed = pointAdjustmentSchema.safeParse(values);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        points: errors.points?.[0],
        reason: errors.reason?.[0],
      });
      return;
    }
    setFieldErrors({});

    try {
      await onSubmit(parsed.data);
      setValues({ points: "", reason: "" });
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 422) {
        setFieldErrors({
          points: error.response.data?.errors?.points?.[0],
          reason: error.response.data?.errors?.reason?.[0],
        });
        return;
      }
      setFormError("Koreksi poin gagal disimpan. Silakan coba lagi.");
    }
  }

  return (
    <Form className="flex w-full flex-col gap-3" onSubmit={handleSubmit}>
      {formError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{formError}</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : null}

      <TextField
        name="points"
        value={values.points}
        onChange={(points) => {
          setValues((previous) => ({ ...previous, points }));
          setFieldErrors((previous) => ({ ...previous, points: undefined }));
        }}
        isInvalid={Boolean(fieldErrors.points)}
        isDisabled={isPending}
      >
        <Label>Perubahan poin</Label>
        <Input fullWidth inputMode="numeric" placeholder="Contoh: 20 atau -10" />
        {fieldErrors.points ? <FieldError>{fieldErrors.points}</FieldError> : null}
      </TextField>

      <TextField
        name="reason"
        value={values.reason}
        onChange={(reason) => {
          setValues((previous) => ({ ...previous, reason }));
          setFieldErrors((previous) => ({ ...previous, reason: undefined }));
        }}
        isInvalid={Boolean(fieldErrors.reason)}
        isDisabled={isPending}
      >
        <Label>Alasan koreksi</Label>
        <TextArea rows={3} placeholder="Jelaskan alasan perubahan poin" />
        {fieldErrors.reason ? <FieldError>{fieldErrors.reason}</FieldError> : null}
      </TextField>

      <Button
        type="submit"
        isPending={isPending}
        isDisabled={isPending}
        className="bg-teal-600 text-white hover:bg-teal-700"
      >
        Simpan koreksi
      </Button>
    </Form>
  );
}
