import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SuperadminDashboardPageClient } from "@/components/superadmin-dashboard";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

function mockSchoolsList() {
  server.use(
    http.get("*/superadmin/analytics/schools", () =>
      HttpResponse.json({
        data: [
          {
            school_id: 1,
            school_name: "SMA Negeri 1 Bandung",
            guru_count: 2,
            class_count: 4,
            student_count: 60,
          },
          {
            school_id: 2,
            school_name: "SMA Negeri 2 Bandung",
            guru_count: 1,
            class_count: 1,
            student_count: 15,
          },
        ],
      })
    )
  );
}

describe("SuperadminDashboardPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken("test-access-token");
  });
  afterEach(clearToken);

  it("menampilkan ringkasan total sekolah, guru, dan siswa", async () => {
    mockSchoolsList();
    renderWithProviders(<SuperadminDashboardPageClient />);

    expect(await screen.findByText("Total Sekolah")).toBeInTheDocument();
    expect(await screen.findByText("2")).toBeInTheDocument();
    expect(screen.getByText("Total Guru")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Total Siswa")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
  });

  it("menampilkan quick links ke sekolah, guru, dan analitik", async () => {
    mockSchoolsList();
    renderWithProviders(<SuperadminDashboardPageClient />);

    await screen.findByText("Total Sekolah");

    expect(
      screen.getByRole("link", { name: /Kelola Sekolah/ })
    ).toHaveAttribute("href", "/superadmin/schools");
    expect(
      screen.getByRole("link", { name: /Kelola Guru/ })
    ).toHaveAttribute("href", "/superadmin/guru");
    expect(
      screen.getByRole("link", { name: /Analitik Sekolah/ })
    ).toHaveAttribute("href", "/superadmin/analytics");
  });

  it("menampilkan error dengan aksi retry saat gagal dimuat", async () => {
    server.use(
      http.get("*/superadmin/analytics/schools", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );

    renderWithProviders(<SuperadminDashboardPageClient />);

    expect(
      await screen.findByText("Ringkasan gagal dimuat.", {}, { timeout: 10_000 })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
  }, 15_000);
});
