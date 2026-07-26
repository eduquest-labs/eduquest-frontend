import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";
import { deleteClass, updateClass } from "@/services/modules";

describe("kelas service — update/delete", () => {
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
});
