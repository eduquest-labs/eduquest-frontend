import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCreatePointAdjustment } from "@/hooks/mutations";
import { pointsKeys } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as pointsService from "@/services/modules/points.service";

vi.mock("@/services/modules/points.service", async (importOriginal) => {
  const actual = await importOriginal<typeof pointsService>();
  return { ...actual, createPointAdjustment: vi.fn() };
});

describe("points mutation cache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menginvalidasi detail siswa setelah adjustment", async () => {
    vi.mocked(pointsService.createPointAdjustment).mockResolvedValue({
      adjustment: {
        id: 1,
        points: 10,
        reason: "Bonus",
        adjustedBy: { id: 2, name: "Dosen" },
        createdAt: "2026-07-20",
      },
      totalPoints: 10,
      lastSyncedAt: "2026-07-20",
    });
    const queryClient = createQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useCreatePointAdjustment(2, 4), {
      wrapper,
    });

    await act(() => result.current.mutateAsync({ points: 10, reason: "Bonus" }));

    expect(invalidate).toHaveBeenCalledWith({
      queryKey: pointsKeys.student(2, 4),
    });
  });
});
