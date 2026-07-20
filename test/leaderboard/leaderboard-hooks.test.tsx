import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  leaderboardKeys,
  useLeaderboard,
  useProgress,
} from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as leaderboardService from "@/services/modules/leaderboard.service";

vi.mock("@/services/modules/leaderboard.service", async (importOriginal) => {
  const actual = await importOriginal<typeof leaderboardService>();

  return {
    ...actual,
    getLeaderboard: vi.fn(),
    getStudentProgress: vi.fn(),
  };
});

describe("leaderboard queries", () => {
  beforeEach(() => vi.clearAllMocks());

  function wrapper() {
    const queryClient = createQueryClient();

    return {
      queryClient,
      Wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    };
  }

  it("memisahkan cache ranking berdasarkan kelas dan topik", async () => {
    vi.mocked(leaderboardService.getLeaderboard).mockResolvedValue({
      classInfo: { id: 2, name: "Kelas A" },
      topic: { id: 3, name: "Aljabar" },
      topics: [],
      entries: [],
    });
    const { queryClient, Wrapper } = wrapper();
    const { result } = renderHook(() => useLeaderboard(2, 3), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(leaderboardService.getLeaderboard).toHaveBeenCalledWith(2, 3);
    expect(
      queryClient.getQueryData(leaderboardKeys.ranking(2, 3))
    ).toBeDefined();
  });

  it("tidak memuat progress untuk membership tidak valid", () => {
    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useProgress(0, 0, null), {
      wrapper: Wrapper,
    });

    expect(result.current.fetchStatus).toBe("idle");
    expect(leaderboardService.getStudentProgress).not.toHaveBeenCalled();
  });
});
