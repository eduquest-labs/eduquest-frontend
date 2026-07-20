import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentLeaderboardProgress } from "@/components/leaderboard";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

describe("StudentLeaderboardProgress", () => {
  it("menampilkan ranking dan progress kelas pertama", async () => {
    server.use(
      http.get("*/api/auth/session", () =>
        HttpResponse.json({
          user: { id: "6", name: "Alya", role: "siswa" },
          accessToken: "test-token",
          expires: "2099-01-01T00:00:00.000Z",
        })
      ),
      http.get("*/students/me/points", () =>
        HttpResponse.json({
          total_points: 90,
          level: {
            level: 3,
            current_level_points: 10,
            points_to_next_level: 70,
            progress_percentage: 12.5,
          },
          classes: [
            {
              id: 2,
              class_student_id: 4,
              name: "Kelas A",
              total_points: 90,
              last_synced_at: null,
            },
          ],
          next_badge: null,
        })
      ),
      http.get("*/classes/2/leaderboard", () =>
        HttpResponse.json({
          class: { id: 2, name: "Kelas A" },
          topic: null,
          topics: [{ id: 3, name: "Aljabar" }],
          data: [
            {
              rank: 1,
              class_student_id: 4,
              student_name: "Alya",
              score: 90,
            },
            {
              rank: 2,
              class_student_id: 5,
              student_name: "Bima",
              score: 60,
            },
          ],
        })
      ),
      http.get("*/classes/2/students/4/progress", () =>
        HttpResponse.json({
          class: { id: 2, name: "Kelas A" },
          student: { id: 6, class_student_id: 4, name: "Alya" },
          topic: null,
          completed_challenges: 2,
          total_challenges: 5,
          percentage: 40,
        })
      )
    );

    renderWithProviders(<StudentLeaderboardProgress />);

    expect(await screen.findByText("Alya")).toBeInTheDocument();
    expect(screen.getByText("Bima")).toBeInTheDocument();
    expect(
      screen.getByText("2 dari 5 challenge selesai")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("progressbar", { name: /Progress challenge 40%/ })
    ).toBeInTheDocument();
  });
});
