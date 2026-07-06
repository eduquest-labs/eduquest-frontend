import { z } from "zod";

export const loginSiswaSchema = z.object({
  classCode: z.string().min(1, "Kode kelas wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
});

export type LoginSiswaData = z.infer<typeof loginSiswaSchema>;
