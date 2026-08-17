import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { server } from "@/test/msw/server";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import {
  deleteClass,
  exportClassGrades,
  listClassStudents,
  updateClass,
} from "@/services/modules";
import { clearToken, setToken } from "@/services/token-store";

describe("kelas service — update/delete", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("mengirim hanya name saat update dan mengadaptasi response", async () => {
    server.use(
      http.patch("*/classes/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Kelas Baru" });

        return HttpResponse.json({
          id: 5,
          name: "Kelas Baru",
          class_code: "ABCD1234",
          student_count: 3,
          created_at: "2026-07-13",
        });
      })
    );

    const result = await updateClass(5, { name: "Kelas Baru" });

    expect(result).toEqual({
      id: 5,
      name: "Kelas Baru",
      classCode: "ABCD1234",
      studentCount: 3,
      createdAt: "2026-07-13",
    });
  });

  it("mempertahankan enrollment id serta identitas roster siswa", async () => {
    server.use(
      http.get("*/classes/5/students", () =>
        HttpResponse.json({
          data: [
            {
              id: 11,
              student_id: 27,
              name: "Nama Internal",
              nisn: "0000002001",
              jenis_kelamin: "L",
              is_claimed: true,
              joined_at: "2026-07-01T08:00:00+07:00",
            },
          ],
        })
      )
    );

    await expect(listClassStudents(5)).resolves.toEqual([
      {
        id: 11,
        studentId: 27,
        name: "Nama Internal",
        nisn: "0000002001",
        jenisKelamin: "L",
        isClaimed: true,
        joinedAt: "2026-07-01T08:00:00+07:00",
      },
    ]);
  });

  it("tidak mengirim field lain selain name walau dipanggil dengan classCode", async () => {
    server.use(
      http.patch("*/classes/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).not.toHaveProperty("classCode");
        expect(body).not.toHaveProperty("class_code");

        return HttpResponse.json({
          id: 5,
          name: "Kelas Baru",
          class_code: "ORIGINAL1",
          student_count: 0,
          created_at: "2026-07-13",
        });
      })
    );

    await updateClass(5, { name: "Kelas Baru" });
  });

  it("melempar error saat update gagal validasi (422)", async () => {
    server.use(
      http.patch("*/classes/5", () =>
        HttpResponse.json({ message: "The given data was invalid.", errors: { name: ["Nama kelas wajib diisi."] } }, { status: 422 })
      )
    );

    await expect(updateClass(5, { name: "" })).rejects.toBeDefined();
  });

  it("menghapus kelas tanpa mengembalikan nilai", async () => {
    let calledId: string | null = null;
    server.use(
      http.delete("*/classes/:id", ({ params }) => {
        calledId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(deleteClass(5)).resolves.toBeUndefined();
    expect(calledId).toBe("5");
  });

  it("melempar error saat delete gagal (403)", async () => {
    server.use(
      http.delete("*/classes/5", () =>
        HttpResponse.json({ message: "Forbidden" }, { status: 403 })
      )
    );

    await expect(deleteClass(5)).rejects.toBeDefined();
  });

  it("mengunduh ekspor nilai sebagai blob dengan format dan topic opsional", async () => {
    const blob = new Blob(["grade-data"], { type: "text/csv" });
    const get = vi.spyOn(client, "get").mockResolvedValueOnce({
      data: blob,
      headers: {
        "content-disposition": "attachment; filename*=UTF-8''nilai-STAT2026.csv",
      },
    });

    try {
      const result = await exportClassGrades(5, { format: "csv", topicId: 9 });

      expect(result).toEqual({ blob, filename: "nilai-STAT2026.csv" });
      expect(get).toHaveBeenCalledWith(API_ENDPOINTS.KELAS.EXPORT_GRADES(5), {
        params: { format: "csv", identity: "anonymous", topic_id: 9 },
        responseType: "blob",
      });
    } finally {
      get.mockRestore();
    }
  });

  it("memakai fallback filename dan meneruskan error ekspor", async () => {
    const blob = new Blob(["grade-data"]);
    const get = vi
      .spyOn(client, "get")
      .mockResolvedValueOnce({ data: blob, headers: {} })
      .mockRejectedValueOnce(new Error("export failed"));

    try {
      await expect(exportClassGrades(5, { format: "xlsx" })).resolves.toEqual({
        blob,
        filename: "nilai-kelas-5.xlsx",
      });
      await expect(exportClassGrades(5, { format: "xlsx" })).rejects.toThrow("export failed");
    } finally {
      get.mockRestore();
    }
  });
});
