import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useDeactivateGuru,
  useReactivateGuru,
  useUpdateGuru,
} from "@/hooks/mutations";
import { superadminGuruKeys } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as superadminGuruService from "@/services/modules/superadmin-guru.service";

vi.mock("@/services/modules/superadmin-guru.service", async (importOriginal) => {
  const actual = await importOriginal<typeof superadminGuruService>();
  return {
    ...actual,
    updateGuru: vi.fn(),
    deactivateGuru: vi.fn(),
    reactivateGuru: vi.fn(),
  };
});

function renderWithQueryClient<T>(hook: () => T) {
  const queryClient = createQueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const rendered = renderHook(hook, { wrapper });
  return { ...rendered, invalidate };
}

describe("superadmin-guru mutation cache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useUpdateGuru calls the service and invalidates the list", async () => {
    vi.mocked(superadminGuruService.updateGuru).mockResolvedValue(undefined);

    const { result, invalidate } = renderWithQueryClient(() => useUpdateGuru());

    await act(() =>
      result.current.mutateAsync({ id: 5, name: "Bu Sari", email: "sari@example.com", schoolId: 2 })
    );

    expect(superadminGuruService.updateGuru).toHaveBeenCalledWith(5, {
      name: "Bu Sari",
      email: "sari@example.com",
      schoolId: 2,
    });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminGuruKeys.all });
  });

  it("useDeactivateGuru calls the service and invalidates the list", async () => {
    vi.mocked(superadminGuruService.deactivateGuru).mockResolvedValue(undefined);

    const { result, invalidate } = renderWithQueryClient(() => useDeactivateGuru());

    await act(() => result.current.mutateAsync(5));

    expect(superadminGuruService.deactivateGuru).toHaveBeenCalledWith(5);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminGuruKeys.all });
  });

  it("useReactivateGuru calls the service and invalidates the list", async () => {
    vi.mocked(superadminGuruService.reactivateGuru).mockResolvedValue(undefined);

    const { result, invalidate } = renderWithQueryClient(() => useReactivateGuru());

    await act(() => result.current.mutateAsync({ id: 5, password: "newpass123" }));

    expect(superadminGuruService.reactivateGuru).toHaveBeenCalledWith(5, "newpass123");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminGuruKeys.all });
  });
});
