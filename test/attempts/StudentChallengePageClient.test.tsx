import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { StudentChallengePageClient } from "@/components/attempts";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { setToken } from "@/services/token-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

function studentChallenge(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    class_id: 1,
    class_name: "Kelas A",
    topic_id: 10,
    topic_name: "Termin 2 Topic",
    term_id: 2,
    title: "Kuis Termin 2",
    description: null,
    type: "kuis",
    is_group_challenge: false,
    group_score: null,
    points_reward: 100,
    start_time: null,
    end_time: null,
    timer_seconds: null,
    availability_status: "active",
    ...overrides,
  };
}

function mockGamificationAndLeaderboardEndpoints() {
  server.use(
    http.get("*/students/me/points", () => HttpResponse.json({ total_points: 0, level: 1, challenges_completed: 0, badges: [] })),
    http.get("*/students/me/badges", () => HttpResponse.json({ data: [] })),
    http.get("*/classes/*/leaderboard", () => HttpResponse.json({ data: [] })),
    http.get("*/classes/*/students/*/progress", () => HttpResponse.json({ completed: 0, total: 0 }))
  );
}

describe("StudentChallengePageClient", () => {
  it("shows a locked banner for a term the student has not passed the prerequisite for", async () => {
    setToken("test-access-token");
    mockGamificationAndLeaderboardEndpoints();
    server.use(
      http.get("*/student/challenges", () => HttpResponse.json({ data: [studentChallenge()] })),
      http.get("*/students/me/terms", () =>
        HttpResponse.json({
          data: [
            { term_id: 1, term_name: "Termin 1", sort_order: 0, status: "in_progress", source: "auto" },
            { term_id: 2, term_name: "Termin 2", sort_order: 1, status: "in_progress", source: "auto" },
          ],
        })
      )
    );

    renderWithProviders(<StudentChallengePageClient />);

    expect(await screen.findByText(/Termin 2 — Terkunci/)).toBeInTheDocument();
    expect(screen.queryByText("Kuis Termin 2")).not.toBeInTheDocument();
  });

  it("shows challenges normally for an accessible term", async () => {
    setToken("test-access-token");
    mockGamificationAndLeaderboardEndpoints();
    server.use(
      http.get("*/student/challenges", () => HttpResponse.json({ data: [studentChallenge()] })),
      http.get("*/students/me/terms", () =>
        HttpResponse.json({
          data: [
            { term_id: 1, term_name: "Termin 1", sort_order: 0, status: "passed", source: "auto" },
            { term_id: 2, term_name: "Termin 2", sort_order: 1, status: "in_progress", source: "auto" },
          ],
        })
      )
    );

    renderWithProviders(<StudentChallengePageClient />);

    expect(await screen.findByText("Kuis Termin 2")).toBeInTheDocument();
    expect(screen.queryByText(/Terkunci/)).not.toBeInTheDocument();
  });

  it("hides the start button and shows the group score for a graded group challenge", async () => {
    setToken("test-access-token");
    mockGamificationAndLeaderboardEndpoints();
    server.use(
      http.get("*/student/challenges", () =>
        HttpResponse.json({ data: [studentChallenge({ is_group_challenge: true, group_score: "85.00" })] })
      ),
      http.get("*/students/me/terms", () => HttpResponse.json({ data: [] }))
    );

    renderWithProviders(<StudentChallengePageClient />);

    expect(await screen.findByText("Skor kelompok: 85%")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mulai/ })).not.toBeInTheDocument();
  });

  it("shows a waiting state for an ungraded group challenge", async () => {
    setToken("test-access-token");
    mockGamificationAndLeaderboardEndpoints();
    server.use(
      http.get("*/student/challenges", () =>
        HttpResponse.json({ data: [studentChallenge({ is_group_challenge: true, group_score: null })] })
      ),
      http.get("*/students/me/terms", () => HttpResponse.json({ data: [] }))
    );

    renderWithProviders(<StudentChallengePageClient />);

    expect(await screen.findByText("Belum dinilai guru")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Mulai/ })).not.toBeInTheDocument();
  });
});
