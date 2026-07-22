import { QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { AttemptHistoryPageClient } from "@/components/attempts";
import { createQueryClient } from "@/lib/query-client";
import { clearToken } from "@/services/token-store";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

function historyItem(
  id: number,
  overrides: Partial<{
    is_locked: boolean;
    total_score: number | null;
    grading_status: "pending" | "complete";
    finished_at: string | null;
  }> = {}
) {
  return {
    id,
    challenge: { id, title: `Challenge histori panjang ${id}` },
    topic: { id: 3, name: "Kebugaran" },
    class: { id: 2, name: "Kelas A" },
    started_at: "2026-07-20T08:00:00+07:00",
    finished_at: "2026-07-20T09:00:00+07:00",
    is_locked: true,
    total_score: 80,
    grading_status: "complete" as const,
    ...overrides,
  };
}

describe("AttemptHistoryPageClient", () => {
  beforeEach(() => {
    clearToken();
    server.use(http.get("*/api/auth/session", () => HttpResponse.json({ accessToken: "test-token" })));
  });

  it("menampilkan attempt complete, pending, dan unlocked tanpa aksi attempt", async () => {
    server.use(http.get("*/students/me/attempts", () => HttpResponse.json({
      data: [
        historyItem(1),
        historyItem(2, { grading_status: "pending", total_score: null }),
        historyItem(3, { is_locked: false, total_score: null, finished_at: null }),
      ],
      next_cursor: null,
      prev_cursor: null,
    })));

    renderWithProviders(<AttemptHistoryPageClient />);

    expect(await screen.findByText("Challenge histori panjang 1")).toBeInTheDocument();
    expect(screen.getByText("80 poin")).toBeInTheDocument();
    expect(screen.getByText("Menunggu penilaian")).toBeInTheDocument();
    expect(screen.getAllByText("Belum selesai")).toHaveLength(2);
    expect(screen.getAllByText("Belum tersedia")).toHaveLength(2);
    expect(screen.queryByRole("button", { name: /resume|hapus|detail/i })).not.toBeInTheDocument();
  });

  it("memuat page berikutnya melalui tombol load more", async () => {
    server.use(http.get("*/students/me/attempts", ({ request }) => {
      const cursor = new URL(request.url).searchParams.get("cursor");
      return cursor === "next-token"
        ? HttpResponse.json({ data: [historyItem(2)], next_cursor: null, prev_cursor: "previous" })
        : HttpResponse.json({ data: [historyItem(1)], next_cursor: "next-token", prev_cursor: null });
    }));

    renderWithProviders(<AttemptHistoryPageClient />);
    fireEvent.click(await screen.findByRole("button", { name: /Muat lebih banyak/ }));

    expect(await screen.findByText("Challenge histori panjang 2")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("button", { name: /Muat lebih banyak/ })).not.toBeInTheDocument());
  });

  it("menampilkan empty dan error state secara granular", async () => {
    server.use(http.get("*/students/me/attempts", () => HttpResponse.json({ message: "Gagal" }, { status: 500 })));
    const queryClient = createQueryClient();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    const { unmount } = render(
      <QueryClientProvider client={queryClient}><AttemptHistoryPageClient /></QueryClientProvider>
    );

    expect(await screen.findByText("Riwayat aktivitas gagal dimuat.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
    unmount();

    server.use(http.get("*/students/me/attempts", () => HttpResponse.json({
      data: [], next_cursor: null, prev_cursor: null,
    })));
    renderWithProviders(<AttemptHistoryPageClient />);

    expect(await screen.findByText("Belum ada aktivitas")).toBeInTheDocument();
  });
});
