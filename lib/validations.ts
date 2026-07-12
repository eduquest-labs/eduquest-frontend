import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Email atau ID wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const claimStudentSchema = z
  .object({
    classCode: z.string().min(1, "Kode kelas wajib diisi"),
    nis: z.string().min(1, "NIS wajib diisi").max(20, "NIS maksimal 20 karakter"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    passwordConfirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["passwordConfirmation"],
  });
