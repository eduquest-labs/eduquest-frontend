import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  analyticsKeys,
  useClassComparison,
  useProgressChart,
} from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as analyticsService from "@/services/modules/analytics.service";

vi.mock("@/services/modules/analytics.service", async (importOriginal) => {
  const actual = await importOriginal<typeof analyticsService>();

  return {
    ...actual,
    getClassComparison: vi.fn(),
    getProgressChart: vi.fn(),
  };
});

describe("analytics query", () => {
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

  it("menyimpan snapshot pada query key analytics tanpa polling", async () => {
    vi.mocked(analyticsService.getClassComparison).mockResolvedValue([]);
    const { queryClient, Wrapper } = wrapper();
    const { result } = renderHook(() => useClassComparison(), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsService.getClassComparison).toHaveBeenCalledTimes(1);
    expect(analyticsKeys.classComparison()).toEqual([
      "analytics",
      "class-comparison",
    ]);
    expect(
      queryClient.getQueryData(analyticsKeys.classComparison())
    ).toEqual([]);
  });

  it("menyimpan progres berdasarkan kelas dan siswa tanpa polling", async () => {
    vi.mocked(analyticsService.getProgressChart).mockResolvedValue({
      mode: "student",
      points: [],
    });
    const { queryClient, Wrapper } = wrapper();
    const { result } = renderHook(() => useProgressChart(3, 9), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsService.getProgressChart).toHaveBeenCalledWith(3, 9);
    expect(analyticsKeys.progressChart(3, 9)).toEqual([
      "analytics",
      "progress-chart",
      3,
      9,
    ]);
    expect(
      queryClient.getQueryData(analyticsKeys.progressChart(3, 9))
    ).toEqual({ mode: "student", points: [] });
    expect(
      (
        queryClient.getQueryCache().find({
          queryKey: analyticsKeys.progressChart(3, 9),
        })?.options as { refetchInterval?: unknown } | undefined
      )?.refetchInterval
    ).toBeUndefined();
  });
});
