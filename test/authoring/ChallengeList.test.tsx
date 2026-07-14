import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ChallengeList } from "@/components/authoring/ChallengeList";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { clearToken, setToken } from "@/services/token-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ChallengeList", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("menampilkan availability dan jadwal tetap dalam WIB", async () => {
    server.use(http.get("*/topics/2/challenges", () => HttpResponse.json({ data: [{
      id: 3,
      topic_id: 2,
      title: "Kuis Terjadwal",
      description: null,
      type: "kuis",
      points_reward: 100,
      start_time: "2026-07-20T08:00:00+07:00",
      end_time: "2026-07-20T10:00:00+07:00",
      timer_seconds: 600,
      is_published: true,
      availability_status: "scheduled",
      created_at: "a",
      updated_at: "a",
    }] })));

    renderWithProviders(
      <ChallengeList
        classId={1}
        topic={{ id: 2, classId: 1, name: "Minggu 1", sortOrder: 0, createdAt: "a", updatedAt: "a" }}
        classes={[]}
        enabled
      />
    );

    expect(await screen.findByText("Kuis Terjadwal")).toBeInTheDocument();
    expect(screen.getByText("Terjadwal")).toBeInTheDocument();
    expect(screen.getByText(/20 Jul 2026, 08\.00.*20 Jul 2026, 10\.00 WIB/)).toBeInTheDocument();
  });
});
