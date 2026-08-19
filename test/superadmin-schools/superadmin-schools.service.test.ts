import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";
import {
  createSchool,
  deleteSchool,
  listSchoolsWithStats,
  updateSchool,
} from "@/services/modules";
import { clearToken, setToken } from "@/services/token-store";

describe("superadmin-schools service", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("lists schools with adapted stats", async () => {
    server.use(
      http.get("*/superadmin/analytics/schools", () =>
        HttpResponse.json({
          data: [
            {
              school_id: 1,
              school_name: "SMA Negeri 1 Bandung",
              guru_count: 2,
              class_count: 4,
              student_count: 60,
            },
          ],
        })
      )
    );

    await expect(listSchoolsWithStats()).resolves.toEqual([
      { id: 1, name: "SMA Negeri 1 Bandung", guruCount: 2, classCount: 4, studentCount: 60 },
    ]);
  });

  it("creates a school and returns the adapted result", async () => {
    server.use(
      http.post("*/schools", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "SMA Negeri 6 Bandung" });
        return HttpResponse.json({ id: 6, name: "SMA Negeri 6 Bandung" }, { status: 201 });
      })
    );

    await expect(createSchool("SMA Negeri 6 Bandung")).resolves.toEqual({
      id: 6,
      name: "SMA Negeri 6 Bandung",
    });
  });

  it("updates a school", async () => {
    server.use(
      http.patch("*/schools/6", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "SMA Negeri 6 Bandung (Revisi)" });
        return HttpResponse.json({ id: 6, name: "SMA Negeri 6 Bandung (Revisi)" });
      })
    );

    await expect(updateSchool(6, "SMA Negeri 6 Bandung (Revisi)")).resolves.toEqual({
      id: 6,
      name: "SMA Negeri 6 Bandung (Revisi)",
    });
  });

  it("deletes a school without returning a value", async () => {
    let calledId: string | null = null;
    server.use(
      http.delete("*/schools/:id", ({ params }) => {
        calledId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(deleteSchool(6)).resolves.toBeUndefined();
    expect(calledId).toBe("6");
  });

  it("propagates 422 errors from create", async () => {
    server.use(
      http.post("*/schools", () =>
        HttpResponse.json(
          { message: "The given data was invalid.", errors: { name: ["Nama sekolah wajib diisi."] } },
          { status: 422 }
        )
      )
    );

    await expect(createSchool("")).rejects.toBeDefined();
  });
});
