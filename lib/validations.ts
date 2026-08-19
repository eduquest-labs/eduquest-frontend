import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Email atau NISN wajib diisi"),
  password: z.string().min(1, "Kata sandi wajib diisi"),
});

export const claimStudentSchema = z
  .object({
    classCode: z.string().min(1, "Kode kelas wajib diisi"),
    nisn: z.string().trim().regex(/^\d{10}$/, "NISN harus terdiri dari tepat 10 digit"),
    email: z.string().trim().toLowerCase().email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    passwordConfirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["passwordConfirmation"],
  });

export const registerGuruSchema = z
  .object({
    name: z.string().trim().min(1, "Nama wajib diisi").max(150, "Nama maksimal 150 karakter"),
    email: z.string().trim().toLowerCase().email("Format email tidak valid"),
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    passwordConfirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
    schoolId: z.number({ message: "Sekolah wajib dipilih" }),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["passwordConfirmation"],
  });

export const createClassSchema = z.object({
  name: z.string().min(1, "Nama kelas wajib diisi").max(255, "Nama kelas maksimal 255 karakter"),
});
export type CreateClassFormValues = z.infer<typeof createClassSchema>;

export const createSchoolSchema = z.object({
  name: z.string().min(1, "Nama sekolah wajib diisi").max(255, "Nama sekolah maksimal 255 karakter"),
});
export type CreateSchoolFormValues = z.infer<typeof createSchoolSchema>;

export const reactivateGuruSchema = z
  .object({
    password: z.string().min(8, "Kata sandi minimal 8 karakter"),
    passwordConfirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["passwordConfirmation"],
  });
export type ReactivateGuruFormValues = z.infer<typeof reactivateGuruSchema>;

const ACCEPTED_IMPORT_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_IMPORT_FILE_SIZE_BYTES = 5120 * 1024; // mirrors backend max:5120 (KB)

export const studentSchema = z.object({
  name: z.string().min(1, "Nama siswa wajib diisi").max(150, "Nama siswa maksimal 150 karakter"),
  nisn: z.string().trim().regex(/^\d{10}$/, "NISN harus terdiri dari tepat 10 digit"),
  jenisKelamin: z.enum(["L", "P"], { message: "Jenis kelamin wajib diisi" }),
});
export type StudentFormValues = z.infer<typeof studentSchema>;

export const importStudentsSchema = z.object({
  file: z
    .instanceof(File, { message: "File wajib dipilih" })
    .refine((file) => file.size <= MAX_IMPORT_FILE_SIZE_BYTES, "Ukuran file maksimal 5 MB")
    .refine(
      (file) => ACCEPTED_IMPORT_TYPES.includes(file.type) || /\.(csv|xlsx|xls)$/i.test(file.name),
      "Format file harus CSV, XLS, atau XLSX"
    ),
});
export type ImportStudentsFormValues = z.infer<typeof importStudentsSchema>;
