import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GuruPageClient } from "@/components/superadmin-guru";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

function isGuruListPath(url: string): boolean {
  return new URL(url).pathname.endsWith("/guru");
}

function mockGuruList() {
  server.use(
    http.get("*/superadmin/analytics/guru", () =>
      HttpResponse.json({
        data: [
          { guru_id: 5, guru_name: "Bu Sari", school_name: "SMA Negeri 1 Bandung", class_count: 2, student_count: 30 },
          { guru_id: 6, guru_name: "Pak Budi", school_name: "SMA Negeri 1 Bandung", class_count: 0, student_count: 0 },
        ],
      })
    ),
    http.get("*", ({ request }) => {
      if (!isGuruListPath(request.url)) return undefined;

      return HttpResponse.json({
        data: [
          { id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 1, is_active: true },
          { id: 6, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: false },
        ],
      });
    }),
    http.get("*/schools", () =>
      HttpResponse.json({ data: [{ id: 1, name: "SMA Negeri 1 Bandung" }] })
    )
  );
}

describe("GuruPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken("test-access-token");
  });
  afterEach(clearToken);

  it("renders the guru table with stats and active/inactive status", async () => {
    mockGuruList();
    renderWithProviders(<GuruPageClient />);

    expect(await screen.findByText("Bu Sari")).toBeInTheDocument();
    expect(screen.getByText("Pak Budi")).toBeInTheDocument();
    expect(screen.getByText("Aktif")).toBeInTheDocument();
    expect(screen.getByText("Nonaktif")).toBeInTheDocument();
  });

  it("deactivates an active guru after confirmation", async () => {
    mockGuruList();
    server.use(
      http.delete("*/guru/5", () => {
        server.use(
          http.get("*/superadmin/analytics/guru", () =>
            HttpResponse.json({
              data: [
                { guru_id: 5, guru_name: "Bu Sari", school_name: "SMA Negeri 1 Bandung", class_count: 2, student_count: 30 },
                { guru_id: 6, guru_name: "Pak Budi", school_name: "SMA Negeri 1 Bandung", class_count: 0, student_count: 0 },
              ],
            })
          ),
          http.get("*", ({ request }) => {
            if (!isGuruListPath(request.url)) return undefined;

            return HttpResponse.json({
              data: [
                { id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 1, is_active: false },
                { id: 6, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: false },
              ],
            });
          })
        );
        return new HttpResponse(null, { status: 204 });
      })
    );
    renderWithProviders(<GuruPageClient />);
    await screen.findByText("Bu Sari");

    fireEvent.click(screen.getByRole("button", { name: /nonaktifkan/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Nonaktifkan" }));

    await waitFor(() => expect(screen.getAllByText("Nonaktif")).toHaveLength(2));
  });

  it("reactivates an inactive guru via the modal form", async () => {
    mockGuruList();
    server.use(
      http.patch("*/guru/6/reactivate", () => {
        server.use(
          http.get("*/superadmin/analytics/guru", () =>
            HttpResponse.json({
              data: [
                { guru_id: 5, guru_name: "Bu Sari", school_name: "SMA Negeri 1 Bandung", class_count: 2, student_count: 30 },
                { guru_id: 6, guru_name: "Pak Budi", school_name: "SMA Negeri 1 Bandung", class_count: 0, student_count: 0 },
              ],
            })
          ),
          http.get("*", ({ request }) => {
            if (!isGuruListPath(request.url)) return undefined;

            return HttpResponse.json({
              data: [
                { id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 1, is_active: true },
                { id: 6, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: true },
              ],
            });
          })
        );
        return HttpResponse.json({ id: 6, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: true });
      })
    );
    renderWithProviders(<GuruPageClient />);
    await screen.findByText("Pak Budi");

    fireEvent.click(screen.getByRole("button", { name: "Aktifkan" }));
    fireEvent.change(await screen.findByLabelText("Kata Sandi Baru"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Ulangi Kata Sandi Baru"), {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Aktifkan Akun" }));

    await waitFor(() => expect(screen.getAllByText("Aktif")).toHaveLength(2));
  });

  it(
    "shows an error state with retry when the list fails to load",
    async () => {
      server.use(
        http.get("*/superadmin/analytics/guru", () => HttpResponse.json({ data: [] })),
        http.get("*", ({ request }) => {
          if (!isGuruListPath(request.url)) return undefined;
          return HttpResponse.json({ message: "Server error" }, { status: 500 });
        }),
        http.get("*/schools", () => HttpResponse.json({ data: [] }))
      );
      renderWithProviders(<GuruPageClient />);

      expect(
        await screen.findByText("Gagal memuat daftar guru.", {}, { timeout: 10_000 })
      ).toBeInTheDocument();
    },
    15_000
  );
});
