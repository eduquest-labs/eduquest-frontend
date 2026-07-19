import { z } from "zod";

export const pointAdjustmentSchema = z.object({
  points: z
    .string()
    .trim()
    .min(1, "Jumlah poin wajib diisi.")
    .refine((value) => /^-?\d+$/.test(value), "Jumlah poin harus berupa bilangan bulat.")
    .transform(Number),
  reason: z
    .string()
    .trim()
    .min(1, "Alasan koreksi wajib diisi.")
    .max(255, "Alasan maksimal 255 karakter."),
});

export type PointAdjustmentFormValues = {
  points: string;
  reason: string;
};
