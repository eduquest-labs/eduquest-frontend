import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import {
  DashboardMotionProvider,
  DashboardQuickLinks,
  DosenDashboard,
} from "@/components/dashboard";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const dashboardResponse = {
  total_students: 12,
  active_challenges: 3,
  average_score: 82.5,
  recent_activity: [
    {
      id: 9,
      student_name: "Alya",
      challenge_title: "Sprint 100 Meter",
      class_id: 2,
      class_name: "Kelas A",
      started_at: "2026-07-23T10:00:00+07:00",
      is_locked: true,
      total_score: 90,
    },
    {
      id: 10,
      student_name: "Bima",
      challenge_title: "Latihan Interval",
      class_id: 2,
      class_name: "Kelas A",
      started_at: "2026-07-23T09:00:00+07:00",
      is_locked: false,
      total_score: null,
    },
  ],
};

function useDashboardHandlers() {
  server.use(
    http.get("*/api/auth/session", () =>
      HttpResponse.json({
        user: { id: "1", name: "Dosen", role: "dosen" },
        accessToken: "test-token",
        expires: "2099-01-01T00:00:00.000Z",
      })
    ),
    http.get("*/classes", () =>
      HttpResponse.json({
        data: [
          {
            id: 2,
            name: "Kelas A",
            class_code: "KELASA01",
            student_count: 12,
            created_at: "2026-07-20T10:00:00+07:00",
          },
        ],
      })
    ),
    http.get("*/dosen/dashboard", () =>
      HttpResponse.json(dashboardResponse)
    )
  );
}

describe("DosenDashboard", () => {
  it("menampilkan skeleton granular lalu statistik dan aktivitas", async () => {
    useDashboardHandlers();

    renderWithProviders(<DosenDashboard />);

    expect(screen.getByLabelText("Memuat siswa aktif")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Memuat challenge berjalan")
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Memuat rata-rata skor")).toBeInTheDocument();

    expect(await screen.findByText("Alya")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("82,5")).toBeInTheDocument();
    expect(screen.getByText("Skor 90")).toBeInTheDocument();
    expect(screen.getByText("Berlangsung")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter dashboard berdasarkan kelas")
    ).toBeInTheDocument();
  });

  it("mengganti query dashboard ketika filter kelas dipilih", async () => {
    let selectedClassId: string | null = null;
    useDashboardHandlers();
    server.use(
      http.get("*/dosen/dashboard", ({ request }) => {
        selectedClassId = new URL(request.url).searchParams.get("class_id");

        return HttpResponse.json(dashboardResponse);
      })
    );
    renderWithProviders(<DosenDashboard />);
    await screen.findByText("Alya");

    fireEvent.click(
      screen.getByLabelText("Filter dashboard berdasarkan kelas")
    );
    fireEvent.click(
      await screen.findByRole("option", { name: "Kelas A" })
    );

    await waitFor(() => expect(selectedClassId).toBe("2"));
    expect(await screen.findByText("Menampilkan Kelas A")).toBeInTheDocument();
  });

  it("menampilkan error dashboard tanpa menghilangkan filter", async () => {
    useDashboardHandlers();
    server.use(
      http.get("*/dosen/dashboard", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );

    renderWithProviders(<DosenDashboard />);

    expect(
      await screen.findByText(
        "Ringkasan dashboard gagal dimuat.",
        {},
        { timeout: 10_000 }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter dashboard berdasarkan kelas")
    ).toBeInTheDocument();
    expect(screen.getAllByText("Data gagal dimuat.")).toHaveLength(3);
  });

  it("mempertahankan quick-links yang dapat diakses di dalam motion provider", () => {
    renderWithProviders(
      <DashboardMotionProvider>
        <DashboardQuickLinks />
      </DashboardMotionProvider>
    );

    expect(screen.getByRole("link", { name: /Kelas Saya/i })).toHaveAttribute(
      "href",
      "/dosen/kelas"
    );
    expect(screen.getByRole("link", { name: /Authoring/i })).toHaveAttribute(
      "href",
      "/dosen/authoring"
    );
    expect(
      screen.getByRole("link", { name: /Penilaian Esai/i })
    ).toHaveAttribute("href", "/dosen/grading");
  });
});
