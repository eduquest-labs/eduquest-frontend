import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getDosenDashboard } from "@/services/modules";
import { server } from "@/test/msw/server";

const response = {
  total_students: 12,
  active_challenges: 3,
  average_score: 82.5,
  recent_activity: [],
};

describe("dashboard service", () => {
  it("tidak mengirim class_id untuk agregat seluruh kelas", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/dosen/dashboard", ({ request }) => {
        expect(new URL(request.url).searchParams.has("class_id")).toBe(false);

        return HttpResponse.json(response);
      })
    );

    await expect(getDosenDashboard(null)).resolves.toMatchObject({
      totalStudents: 12,
      averageScore: 82.5,
    });
  });

  it("mengirim class_id ketika kelas dipilih", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/dosen/dashboard", ({ request }) => {
        expect(new URL(request.url).searchParams.get("class_id")).toBe("4");

        return HttpResponse.json(response);
      })
    );

    await expect(getDosenDashboard(4)).resolves.toMatchObject({
      activeChallenges: 3,
    });
  });
});
