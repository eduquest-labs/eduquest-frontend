import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  getLeaderboard,
  getStudentProgress,
} from "@/services/modules";
import { server } from "@/test/msw/server";

describe("leaderboard service", () => {
  it("mengirim topic_id hanya ketika filter dipilih", async () => {
    server.use(
      http.get("*/classes/2/leaderboard", ({ request }) => {
        expect(new URL(request.url).searchParams.get("topic_id")).toBe("3");

        return HttpResponse.json({
          class: { id: 2, name: "Kelas A" },
          topic: { id: 3, name: "Aljabar" },
          topics: [{ id: 3, name: "Aljabar" }],
          data: [
            {
              rank: 1,
              class_student_id: 4,
              student_name: "Alya",
              score: 90,
            },
          ],
        });
      })
    );

    await expect(getLeaderboard(2, 3)).resolves.toMatchObject({
      topic: { id: 3 },
      entries: [{ classStudentId: 4 }],
    });
  });

  it("memuat progress melalui nested membership endpoint", async () => {
    server.use(
      http.get("*/classes/2/students/4/progress", ({ request }) => {
        expect(new URL(request.url).searchParams.has("topic_id")).toBe(false);

        return HttpResponse.json({
          class: { id: 2, name: "Kelas A" },
          student: { id: 5, class_student_id: 4, name: "Alya" },
          topic: null,
          completed_challenges: 2,
          total_challenges: 5,
          percentage: 40,
        });
      })
    );

    await expect(getStudentProgress(2, 4, null)).resolves.toMatchObject({
      completedChallenges: 2,
      percentage: 40,
    });
  });
});
