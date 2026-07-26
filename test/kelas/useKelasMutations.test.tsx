import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDeleteClass, useUpdateClass } from "@/hooks/mutations";
import { kelasKeys } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as kelasService from "@/services/modules/kelas.service";

vi.mock("@/services/modules/kelas.service", async (importOriginal) => {
  const actual = await importOriginal<typeof kelasService>();
  return { ...actual, updateClass: vi.fn(), deleteClass: vi.fn() };
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

describe("kelas mutation cache — update/delete", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useUpdateClass memanggil service dan menginvalidasi detail serta list", async () => {
    vi.mocked(kelasService.updateClass).mockResolvedValue({
      id: 5,
      name: "Kelas Baru",
      classCode: "ABCD1234",
      studentCount: 3,
      createdAt: "2026-07-13",
    });

    const { result, invalidate } = renderWithQueryClient(() => useUpdateClass(5));

    await act(() => result.current.mutateAsync({ name: "Kelas Baru" }));

    expect(kelasService.updateClass).toHaveBeenCalledWith(5, { name: "Kelas Baru" });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: kelasKeys.detail(5) });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: kelasKeys.lists() });
  });

  it("useDeleteClass memanggil service dan menginvalidasi list saja", async () => {
    vi.mocked(kelasService.deleteClass).mockResolvedValue(undefined);

    const { result, invalidate } = renderWithQueryClient(() => useDeleteClass());

    await act(() => result.current.mutateAsync(5));

    expect(kelasService.deleteClass).toHaveBeenCalledWith(5);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: kelasKeys.lists() });
    expect(invalidate).not.toHaveBeenCalledWith({ queryKey: kelasKeys.detail(5) });
  });
});
