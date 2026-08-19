import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  useCreateSchool,
  useDeleteSchool,
  useUpdateSchool,
} from "@/hooks/mutations";
import { superadminSchoolKeys } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as superadminSchoolsService from "@/services/modules/superadmin-schools.service";

vi.mock("@/services/modules/superadmin-schools.service", async (importOriginal) => {
  const actual = await importOriginal<typeof superadminSchoolsService>();
  return {
    ...actual,
    createSchool: vi.fn(),
    updateSchool: vi.fn(),
    deleteSchool: vi.fn(),
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

describe("superadmin-schools mutation cache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("useCreateSchool calls the service and invalidates the list", async () => {
    vi.mocked(superadminSchoolsService.createSchool).mockResolvedValue({
      id: 6,
      name: "SMA Negeri 6 Bandung",
    });

    const { result, invalidate } = renderWithQueryClient(() => useCreateSchool());

    await act(() => result.current.mutateAsync("SMA Negeri 6 Bandung"));

    expect(superadminSchoolsService.createSchool).toHaveBeenCalledWith("SMA Negeri 6 Bandung");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminSchoolKeys.all });
  });

  it("useUpdateSchool calls the service with id+name and invalidates the list", async () => {
    vi.mocked(superadminSchoolsService.updateSchool).mockResolvedValue({
      id: 6,
      name: "Nama Baru",
    });

    const { result, invalidate } = renderWithQueryClient(() => useUpdateSchool());

    await act(() => result.current.mutateAsync({ id: 6, name: "Nama Baru" }));

    expect(superadminSchoolsService.updateSchool).toHaveBeenCalledWith(6, "Nama Baru");
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminSchoolKeys.all });
  });

  it("useDeleteSchool calls the service and invalidates the list", async () => {
    vi.mocked(superadminSchoolsService.deleteSchool).mockResolvedValue(undefined);

    const { result, invalidate } = renderWithQueryClient(() => useDeleteSchool());

    await act(() => result.current.mutateAsync(6));

    expect(superadminSchoolsService.deleteSchool).toHaveBeenCalledWith(6);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: superadminSchoolKeys.all });
  });
});
