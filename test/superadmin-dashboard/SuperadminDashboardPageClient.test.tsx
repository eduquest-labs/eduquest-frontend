import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SuperadminDashboardPageClient } from "@/components/superadmin-dashboard";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

vi.mock("@/components/base/shared/EChart", () => ({
  EChart: ({ ariaLabel }: { ariaLabel: string }) => <div role="img" aria-label={ariaLabel} />,
}));

const snapshot = {
  period: { start_date: "2026-09-02", end_date: "2026-10-01", timezone: "Asia/Jakarta" },
  generated_at: "2026-10-01T13:00:00+07:00",
  overview: {
    school_count: 2, guru_count: 3, active_guru_count: 2, class_count: 5, student_count: 75,
    participant_count: 45, participation_percent: 60, started_count: 90, submitted_count: 80,
    final_count: 70, pending_count: 10, average_raw_score: 72.4, average_duration_minutes: 12,
    active_challenge_count: 4, physical_completed_count: 6, physical_distance_km: 8.4,
    physical_duration_minutes: 110, oldest_pending_at: null,
  },
  daily: [{ date: "2026-10-01", started_count: 5, submitted_count: 4, physical_count: 2 }],
  schools: [{
    school_id: 1, school_name: "SMA Negeri 1 Bandung", guru_count: 2, class_count: 4, student_count: 60,
    participant_count: 45, participation_percent: 75, started_count: 90, submitted_count: 80,
    final_count: 70, pending_count: 10, average_raw_score: 72.4,
  }],
  challenges: { active: 4, scheduled: 2, draft: 3, ended: 6 },
};

function mockSnapshot() {
  server.use(
    http.get("*/superadmin/dashboard", () => HttpResponse.json({ data: snapshot })),
    http.get("*/superadmin/analytics/schools", () => HttpResponse.json({ data: [
      { school_id: 1, school_name: "SMA Negeri 1 Bandung", guru_count: 2, class_count: 4, student_count: 60 },
      { school_id: 2, school_name: "SMA Negeri 2 Bandung", guru_count: 1, class_count: 1, student_count: 15 },
    ] })),
  );
}

describe("SuperadminDashboardPageClient", () => {
  beforeEach(() => { vi.clearAllMocks(); setToken("test-access-token"); });
  afterEach(clearToken);

  it("shows research coverage, distinct participation, trends and operational context", async () => {
    mockSnapshot();
    renderWithProviders(<SuperadminDashboardPageClient />);
    expect(within(await screen.findByRole("table")).getByText("SMA Negeri 1 Bandung")).toBeInTheDocument();
    expect(screen.getByText("75", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Tren harian/ })).toBeInTheDocument();
    expect(screen.getByText("Aktivitas fisik")).toBeInTheDocument();
    expect(screen.getByText("Antrean penilaian")).toBeInTheDocument();
  });

  it("automatically sends date and school changes to the backend", async () => {
    mockSnapshot();
    let query = "";
    server.use(http.get("*/superadmin/dashboard", ({ request }) => { query = new URL(request.url).search; return HttpResponse.json({ data: snapshot }); }));
    renderWithProviders(<SuperadminDashboardPageClient />);
    await screen.findByRole("table");
    fireEvent.change(screen.getByLabelText("Dari tanggal"), { target: { value: "2026-09-20" } });
    await waitFor(() => expect(query).toContain("start_date=2026-09-20"));
    fireEvent.change(screen.getByLabelText("Sampai tanggal"), { target: { value: "2026-09-30" } });
    await waitFor(() => expect(query).toContain("end_date=2026-09-30"));
    fireEvent.click(screen.getByRole("button", { name: /Lingkup sekolah/ }));
    fireEvent.click(await screen.findByRole("option", { name: "SMA Negeri 1 Bandung" }));
    await waitFor(() => expect(query).toContain("school_id=1"));
    expect(query).toContain("start_date=2026-09-20");
    expect(query).toContain("end_date=2026-09-30");
    expect(query).toContain("school_id=1");
    expect(screen.queryByRole("button", { name: "Terapkan" })).not.toBeInTheDocument();
  });

  it("keeps invalid date ranges out of requests and automatically applies a preset", async () => {
    mockSnapshot();
    const requests: string[] = [];
    server.use(http.get("*/superadmin/dashboard", ({ request }) => { requests.push(new URL(request.url).search); return HttpResponse.json({ data: snapshot }); }));
    renderWithProviders(<SuperadminDashboardPageClient />);
    await screen.findByRole("table");
    const initialRequests = requests.length;
    fireEvent.change(screen.getByLabelText("Dari tanggal"), { target: { value: "2026-01-01" } });
    expect(screen.getByRole("alert")).toHaveTextContent("Pilih rentang 1–90 hari");
    expect(requests).toHaveLength(initialRequests);
    fireEvent.click(screen.getByRole("button", { name: "7 hari" }));
    await waitFor(() => expect(requests.length).toBeGreaterThan(initialRequests));
    const params = new URLSearchParams(requests.at(-1));
    expect((Date.parse(params.get("end_date")!) - Date.parse(params.get("start_date")!)) / 86400000).toBe(6);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps links to management and analytics", async () => {
    mockSnapshot();
    renderWithProviders(<SuperadminDashboardPageClient />);
    await screen.findByRole("table");
    expect(screen.getByRole("link", { name: /Kelola Sekolah/ })).toHaveAttribute("href", "/superadmin/schools");
    expect(screen.getByRole("link", { name: /Kelola Guru/ })).toHaveAttribute("href", "/superadmin/guru");
    expect(screen.getByRole("link", { name: /Analitik Sekolah/ })).toHaveAttribute("href", "/superadmin/analytics");
  });

  it("shows failure without presenting missing metrics as zero", async () => {
    mockSnapshot();
    server.use(http.get("*/superadmin/dashboard", () => HttpResponse.json({ message: "Server error" }, { status: 500 })));
    renderWithProviders(<SuperadminDashboardPageClient />);
    expect(await screen.findByText("Ringkasan gagal dimuat.", {}, { timeout: 10_000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
    expect(within(screen.getByLabelText("Ringkasan riset")).queryByText("0")).not.toBeInTheDocument();
  }, 15_000);
});
