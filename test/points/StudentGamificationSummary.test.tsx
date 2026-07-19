import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentGamificationSummary } from "@/components/points-badges";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

describe("StudentGamificationSummary", () => {
  it("menampilkan total, breakdown kelas, progress, dan badge", async () => {
    server.use(
      http.get("*/students/me/points", () =>
        HttpResponse.json({
          total_points: 80,
          classes: [
            {
              id: 2,
              class_student_id: 4,
              name: "Kelas A",
              total_points: 80,
              last_synced_at: null,
            },
          ],
          next_badge: {
            id: 2,
            name: "Poin 100",
            description: null,
            criteria_type: "total_points",
            criteria_value: 100,
          },
        })
      ),
      http.get("*/students/me/badges", () =>
        HttpResponse.json({
          data: [
            {
              id: 5,
              badge: {
                id: 1,
                name: "Pemula",
                description: null,
                criteria_type: "challenges_completed",
                criteria_value: 1,
              },
              awarded_at: "2026-07-20T08:00:00+07:00",
              awarded_by: null,
              award_source: "automatic",
            },
          ],
        })
      )
    );

    renderWithProviders(<StudentGamificationSummary />);

    expect(await screen.findByText("80")).toBeInTheDocument();
    expect(screen.getByText("Kelas A: 80")).toBeInTheDocument();
    expect(screen.getByText("Menuju Poin 100")).toBeInTheDocument();
    expect(screen.getByText("Pemula")).toBeInTheDocument();
  });
});
