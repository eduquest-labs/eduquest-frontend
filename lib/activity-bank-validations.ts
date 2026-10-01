import { z } from "zod";
const link = z.object({ label: z.string().trim().min(1, "Label tautan wajib diisi").max(200), url: z.url().refine((value) => /^https?:\/\//i.test(value), "Gunakan tautan HTTP atau HTTPS") });
export const bankMaterialSchema = z.object({
  folderId: z.number().int().positive("Pilih folder"), title: z.string().trim().min(1, "Judul wajib diisi").max(200),
  summary: z.string().max(20000), objectives: z.string().max(20000), explanation: z.string().max(20000), equipmentAndPlace: z.string().max(20000),
  steps: z.string().max(20000), taskInstruction: z.string().max(20000), targetLevel: z.string().max(100), tags: z.array(z.string().trim().max(80)).max(20),
  mediaLinks: z.array(link).max(30), references: z.array(link).max(30),
});
export const bankFolderSchema = z.object({ name: z.string().trim().min(1, "Nama folder wajib diisi").max(150), parentId: z.number().int().positive().nullable() });
