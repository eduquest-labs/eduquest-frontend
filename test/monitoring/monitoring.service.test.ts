import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { getMonitoring } from "@/services/modules";
import { server } from "@/test/msw/server";

const response = {
  data: [
    {
      id: 9,
      student_name: "Alya",
      challenge_title: "Sprint",
      class_id: 2,
      class_name: "Kelas A",
      started_at: "2026-07-26T09:55:00+07:00",
      finished_at: null,
      status: "in_progress" as const,
      total_score: null,
    },
  ],
};

describe("monitoring service", () => {
  it("tidak mengirim class_id untuk feed seluruh kelas", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/dosen/monitoring", ({ request }) => {
        expect(new URL(request.url).searchParams.has("class_id")).toBe(false);

        return HttpResponse.json(response);
      })
    );

    await expect(getMonitoring(null)).resolves.toMatchObject([
      { studentName: "Alya", status: "in_progress" },
    ]);
  });

  it("mengirim class_id saat feed difilter", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/dosen/monitoring", ({ request }) => {
        expect(new URL(request.url).searchParams.get("class_id")).toBe("4");

        return HttpResponse.json(response);
      })
    );

    await expect(getMonitoring(4)).resolves.toHaveLength(1);
  });
});
