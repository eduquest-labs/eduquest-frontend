import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { server } from "@/test/msw/server";
import {
  deactivateGuru,
  listGuruWithStats,
  reactivateGuru,
  updateGuru,
} from "@/services/modules";
import { clearToken, setToken } from "@/services/token-store";

function isGuruListPath(url: string): boolean {
  return new URL(url).pathname.endsWith("/guru");
}

describe("superadmin-guru service", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("merges the list and analytics endpoints by guru id", async () => {
    server.use(
      http.get("*/superadmin/analytics/guru", () =>
        HttpResponse.json({
          data: [
            {
              guru_id: 5,
              guru_name: "Bu Sari",
              school_name: "SMA Negeri 2 Bandung",
              class_count: 3,
              student_count: 42,
            },
          ],
        })
      ),
      http.get("*", ({ request }) => {
        if (!isGuruListPath(request.url)) return undefined;

        return HttpResponse.json({
          data: [
            { id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 2, is_active: true },
          ],
        });
      })
    );

    await expect(listGuruWithStats()).resolves.toEqual([
      {
        id: 5,
        name: "Bu Sari",
        email: "sari@example.com",
        schoolId: 2,
        schoolName: "SMA Negeri 2 Bandung",
        classCount: 3,
        studentCount: 42,
        isActive: true,
      },
    ]);
  });

  it("defaults to zero stats when a guru is missing from the analytics response", async () => {
    server.use(
      http.get("*/superadmin/analytics/guru", () => HttpResponse.json({ data: [] })),
      http.get("*", ({ request }) => {
        if (!isGuruListPath(request.url)) return undefined;

        return HttpResponse.json({
          data: [
            { id: 6, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: false },
          ],
        });
      })
    );

    await expect(listGuruWithStats()).resolves.toEqual([
      {
        id: 6,
        name: "Pak Budi",
        email: "budi@example.com",
        schoolId: 1,
        schoolName: null,
        classCount: 0,
        studentCount: 0,
        isActive: false,
      },
    ]);
  });

  it("passes school_id to both endpoints when filtering", async () => {
    let listUrl = "";
    let analyticsUrl = "";
    server.use(
      http.get("*/superadmin/analytics/guru", ({ request }) => {
        analyticsUrl = request.url;
        return HttpResponse.json({ data: [] });
      }),
      http.get("*", ({ request }) => {
        if (!isGuruListPath(request.url)) return undefined;
        listUrl = request.url;
        return HttpResponse.json({ data: [] });
      })
    );

    await listGuruWithStats(3);

    expect(listUrl).toContain("school_id=3");
    expect(analyticsUrl).toContain("school_id=3");
  });

  it("updates a guru", async () => {
    server.use(
      http.patch("*/guru/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Bu Sari Baru", email: "sari2@example.com", school_id: 3 });
        return HttpResponse.json({ id: 5, name: "Bu Sari Baru", email: "sari2@example.com", school_id: 3 });
      })
    );

    await expect(
      updateGuru(5, { name: "Bu Sari Baru", email: "sari2@example.com", schoolId: 3 })
    ).resolves.toBeUndefined();
  });

  it("deactivates a guru", async () => {
    let calledId: string | null = null;
    server.use(
      http.delete("*/guru/:id", ({ params }) => {
        calledId = params.id as string;
        return new HttpResponse(null, { status: 204 });
      })
    );

    await expect(deactivateGuru(5)).resolves.toBeUndefined();
    expect(calledId).toBe("5");
  });

  it("reactivates a guru with a new password", async () => {
    server.use(
      http.patch("*/guru/5/reactivate", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ password: "newpass123", password_confirmation: "newpass123" });
        return HttpResponse.json({ id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 2, is_active: true });
      })
    );

    await expect(reactivateGuru(5, "newpass123")).resolves.toBeUndefined();
  });
});
