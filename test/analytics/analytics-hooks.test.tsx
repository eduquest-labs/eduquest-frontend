import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  analyticsKeys,
  useClassComparison,
} from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as analyticsService from "@/services/modules/analytics.service";

vi.mock("@/services/modules/analytics.service", async (importOriginal) => {
  const actual = await importOriginal<typeof analyticsService>();

  return {
    ...actual,
    getClassComparison: vi.fn(),
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
});
