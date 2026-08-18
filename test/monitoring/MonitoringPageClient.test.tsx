import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { MonitoringPageClient } from "@/components/monitoring";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const monitoringResponse = {
  data: [
    {
      id: 9,
      student_name: "Alya",
      challenge_title: "Kuis Pecahan",
      class_id: 2,
      class_name: "Kelas A",
      started_at: "2026-07-26T09:55:00+07:00",
      finished_at: null,
      status: "in_progress",
      total_score: null,
    },
    {
      id: 10,
      student_name: "Bima",
      challenge_title: "Sprint 100 Meter",
      class_id: 2,
      class_name: "Kelas A",
      started_at: "2026-07-26T09:50:00+07:00",
      finished_at: "2026-07-26T09:59:00+07:00",
      status: "just_submitted",
      total_score: 90,
    },
  ],
};

function useMonitoringHandlers() {
  server.use(
    http.get("*/api/auth/session", () =>
      HttpResponse.json({
        user: { id: "1", name: "Guru", role: "guru" },
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
    http.get("*/dosen/monitoring", () =>
      HttpResponse.json(monitoringResponse)
    )
  );
}

describe("MonitoringPageClient", () => {
  it("menampilkan skeleton lalu feed dengan dua status", async () => {
    useMonitoringHandlers();

    renderWithProviders(<MonitoringPageClient />);

    expect(
      screen.getByLabelText("Memuat aktivitas monitoring")
    ).toBeInTheDocument();
    expect(await screen.findByText("Alya")).toBeInTheDocument();
    expect(screen.getByText("Bima")).toBeInTheDocument();
    expect(screen.getByText("Sedang mengerjakan")).toBeInTheDocument();
    expect(screen.getByText("Baru submit")).toBeInTheDocument();
    expect(screen.getByText("Skor 90")).toBeInTheDocument();
    expect(screen.getByText(/Terakhir diperbarui/)).toBeInTheDocument();
  });

  it("mengganti request monitoring ketika kelas dipilih", async () => {
    let selectedClassId: string | null = null;
    useMonitoringHandlers();
    server.use(
      http.get("*/dosen/monitoring", ({ request }) => {
        selectedClassId = new URL(request.url).searchParams.get("class_id");

        return HttpResponse.json(monitoringResponse);
      })
    );
    renderWithProviders(<MonitoringPageClient />);
    await screen.findByText("Alya");

    fireEvent.click(
      screen.getByLabelText("Filter monitoring berdasarkan kelas")
    );
    fireEvent.click(
      await screen.findByRole("option", { name: "Kelas A" })
    );

    await waitFor(() => expect(selectedClassId).toBe("2"));
    expect(await screen.findByText("Menampilkan Kelas A")).toBeInTheDocument();
  });

  it("menampilkan empty state dan error granular", async () => {
    useMonitoringHandlers();
    server.use(
      http.get("*/dosen/monitoring", () =>
        HttpResponse.json({ data: [] })
      )
    );
    const view = renderWithProviders(<MonitoringPageClient />);

    expect(
      await screen.findByText("Belum ada aktivitas live")
    ).toBeInTheDocument();

    view.unmount();
    useMonitoringHandlers();
    server.use(
      http.get("*/dosen/monitoring", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );
    renderWithProviders(<MonitoringPageClient />);

    expect(
      await screen.findByText(
        "Feed monitoring gagal diperbarui.",
        {},
        { timeout: 10_000 }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Filter monitoring berdasarkan kelas")
    ).toBeInTheDocument();
    expect(screen.getByText("Feed monitoring belum dapat dimuat.")).toBeInTheDocument();
  });
});
