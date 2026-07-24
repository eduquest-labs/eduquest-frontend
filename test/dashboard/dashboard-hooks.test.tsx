import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DASHBOARD_REFETCH_INTERVAL_MS } from "@/config/constants";
import { dashboardKeys, useDashboard } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as dashboardService from "@/services/modules/dashboard.service";

vi.mock("@/services/modules/dashboard.service", async (importOriginal) => {
  const actual = await importOriginal<typeof dashboardService>();

  return {
    ...actual,
    getDosenDashboard: vi.fn(),
  };
});

describe("dashboard query", () => {
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

  it("memisahkan cache berdasarkan filter kelas", async () => {
    vi.mocked(dashboardService.getDosenDashboard).mockResolvedValue({
      totalStudents: 4,
      activeChallenges: 2,
      averageScore: 75,
      recentActivity: [],
    });
    const { queryClient, Wrapper } = wrapper();
    const { result } = renderHook(() => useDashboard(3), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(dashboardService.getDosenDashboard).toHaveBeenCalledWith(3);
    expect(queryClient.getQueryData(dashboardKeys.summary(3))).toBeDefined();
    expect(dashboardKeys.summary(null)).toEqual([
      "dashboard",
      "summary",
      "all",
    ]);
  });

  it("menggunakan interval refresh dashboard sedang", () => {
    expect(DASHBOARD_REFETCH_INTERVAL_MS).toBe(60_000);
  });
});
