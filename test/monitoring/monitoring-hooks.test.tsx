import type { ReactNode } from "react";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MONITORING_REFETCH_INTERVAL_MS } from "@/config/constants";
import { monitoringKeys, useMonitoring } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as monitoringService from "@/services/modules/monitoring.service";

vi.mock("@/services/modules/monitoring.service", async (importOriginal) => {
  const actual = await importOriginal<typeof monitoringService>();

  return {
    ...actual,
    getMonitoring: vi.fn(),
  };
});

describe("monitoring query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    focusManager.setFocused(true);
  });

  afterEach(() => {
    focusManager.setFocused(undefined);
    vi.useRealTimers();
  });

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
    vi.mocked(monitoringService.getMonitoring).mockResolvedValue([]);
    const { queryClient, Wrapper } = wrapper();
    renderHook(() => useMonitoring(3), { wrapper: Wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(monitoringService.getMonitoring).toHaveBeenCalledWith(3);
    expect(queryClient.getQueryData(monitoringKeys.feed(3))).toEqual([]);
    expect(monitoringKeys.feed(null)).toEqual([
      "monitoring",
      "feed",
      "all",
    ]);
  });

  it("tidak menjalankan query ketika dinonaktifkan", async () => {
    vi.mocked(monitoringService.getMonitoring).mockResolvedValue([]);
    const { Wrapper } = wrapper();
    renderHook(() => useMonitoring(null, false), { wrapper: Wrapper });

    await act(async () => {
      await Promise.resolve();
    });

    expect(monitoringService.getMonitoring).not.toHaveBeenCalled();
  });

  it("polling setiap lima detik dan berhenti ketika aplikasi tidak fokus", async () => {
    vi.useFakeTimers();
    vi.mocked(monitoringService.getMonitoring).mockResolvedValue([]);
    const { Wrapper } = wrapper();
    renderHook(() => useMonitoring(null), { wrapper: Wrapper });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(monitoringService.getMonitoring).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(MONITORING_REFETCH_INTERVAL_MS);
    });
    expect(monitoringService.getMonitoring).toHaveBeenCalledTimes(2);

    focusManager.setFocused(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(MONITORING_REFETCH_INTERVAL_MS * 2);
    });
    expect(monitoringService.getMonitoring).toHaveBeenCalledTimes(2);
    expect(MONITORING_REFETCH_INTERVAL_MS).toBe(5_000);
  });
});
