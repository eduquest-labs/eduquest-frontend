import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useSchools } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import { server } from "@/test/msw/server";

function wrapper() {
  const queryClient = createQueryClient();

  return {
    Wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  };
}

describe("useSchools", () => {
  it("mengambil daftar sekolah", async () => {
    server.use(
      http.get("*/schools", () =>
        HttpResponse.json({ data: [{ id: 1, name: "SMA Negeri 1 Bandung" }] })
      )
    );

    const { Wrapper } = wrapper();
    const { result } = renderHook(() => useSchools(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ id: 1, name: "SMA Negeri 1 Bandung" }]);
  });
});
