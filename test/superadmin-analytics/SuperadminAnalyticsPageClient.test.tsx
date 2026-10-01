import { fireEvent, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { SuperadminAnalyticsPageClient } from "@/components/superadmin-analytics";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const setOption = vi.fn();
const resize = vi.fn();
const dispose = vi.fn();

vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({ setOption, resize, dispose })),
  use: vi.fn(),
}));
vi.mock("echarts/charts", () => ({
  BarChart: {},
  LineChart: {},
  ScatterChart: {},
}));
vi.mock("echarts/components", () => ({
  AriaComponent: {},
  GridComponent: {},
  TooltipComponent: {},
}));
vi.mock("echarts/renderers", () => ({
  CanvasRenderer: {},
}));

const response = {
  data: [
    {
      school_id: 1,
      school_name: "SMA Negeri 1 Bandung",
      student_count: 18,
      locked_attempt_count: 24,
      scored_attempt_count: 20,
      average_score: 78.25,
      minimum_score: 40,
      maximum_score: 100,
      median_score: 80,
    },
    {
      school_id: 2,
      school_name: "SMA Negeri 2 Bandung",
      student_count: 15,
      locked_attempt_count: 2,
      scored_attempt_count: 0,
      average_score: null,
      minimum_score: null,
      maximum_score: null,
      median_score: null,
    },
  ],
};

function useSuperadminAnalyticsHandlers() {
  server.use(
    http.get("*/api/auth/session", () =>
      HttpResponse.json({
        user: { id: "1", name: "Superadmin", role: "superadmin" },
        accessToken: "test-token",
        expires: "2099-01-01T00:00:00.000Z",
      })
    ),
    http.get("*/superadmin/analytics/schools-comparison", () =>
      HttpResponse.json(response)
    )
  );
}

describe("SuperadminAnalyticsPageClient", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  it("menampilkan loading granular lalu chart dan detail final versus pending", async () => {
    useSuperadminAnalyticsHandlers();

    renderWithProviders(<SuperadminAnalyticsPageClient />);

    expect(
      screen.getByLabelText("Memuat perbandingan sekolah")
    ).toBeInTheDocument();
    expect(
      (await screen.findAllByText("SMA Negeri 1 Bandung")).length
    ).toBeGreaterThan(0);
    expect(
      screen.getAllByText("SMA Negeri 2 Bandung").length
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("img", {
        name: "Perbandingan rata-rata skor mentah final per sekolah",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Distribusi minimum, maksimum, dan median skor mentah final per sekolah",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("78,25")).toBeInTheDocument();
    expect(screen.getByText("2 pending")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(2);
    expect(screen.getByText("— – —")).toBeInTheDocument();
    expect(setOption).toHaveBeenCalledTimes(2);
  });

  it("membedakan empty sekolah dan belum ada skor final", async () => {
    useSuperadminAnalyticsHandlers();
    server.use(
      http.get("*/superadmin/analytics/schools-comparison", () =>
        HttpResponse.json({ data: [] })
      )
    );
    const view = renderWithProviders(<SuperadminAnalyticsPageClient />);

    expect(await screen.findByText("Belum ada sekolah")).toBeInTheDocument();

    view.unmount();
    useSuperadminAnalyticsHandlers();
    server.use(
      http.get("*/superadmin/analytics/schools-comparison", () =>
        HttpResponse.json({ data: [response.data[1]] })
      )
    );
    renderWithProviders(<SuperadminAnalyticsPageClient />);

    expect(
      await screen.findByText(/Belum ada skor final/)
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("menampilkan error granular dengan aksi retry", async () => {
    useSuperadminAnalyticsHandlers();
    server.use(
      http.get("*/superadmin/analytics/schools-comparison", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );

    renderWithProviders(<SuperadminAnalyticsPageClient />);

    expect(
      await screen.findByText(
        "Perbandingan sekolah gagal dimuat.",
        {},
        { timeout: 10_000 }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Coba lagi" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Perbandingan menggunakan skor mentah/)
    ).toBeInTheDocument();
  });

  it("filters the table and exported aggregate together, with a reset action", async () => {
    useSuperadminAnalyticsHandlers();
    const createUrl = vi.fn<(blob: Blob) => string>(() => "blob:test");
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: createUrl, revokeObjectURL: vi.fn() }));
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    renderWithProviders(<SuperadminAnalyticsPageClient />);
    await screen.findByRole("table");
    fireEvent.change(screen.getByLabelText("Sekolah pembanding"), { target: { value: "2" } });
    const table = screen.getByRole("table");
    expect(within(table).queryByText("SMA Negeri 1 Bandung")).not.toBeInTheDocument();
    expect(within(table).getByText("SMA Negeri 2 Bandung")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ekspor CSV" }));
    expect(createUrl).toHaveBeenCalledOnce();
    const blob = createUrl.mock.calls[0][0] as Blob;
    const text = await new Promise<string>((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsText(blob); });
    expect(text).toContain("SMA Negeri 2 Bandung");
    expect(text).not.toContain("SMA Negeri 1 Bandung");
    expect(click).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
    expect(within(screen.getByRole("table")).getByText("SMA Negeri 1 Bandung")).toBeInTheDocument();
    click.mockRestore();
  });

  it("does not mark a school with zero attempts as complete", async () => {
    useSuperadminAnalyticsHandlers();
    server.use(http.get("*/superadmin/analytics/schools-comparison", () => HttpResponse.json({ data: [{ ...response.data[1], locked_attempt_count: 0 }] })));
    renderWithProviders(<SuperadminAnalyticsPageClient />);
    const table = await screen.findByRole("table");
    expect(within(table).getByText("Belum ada data")).toBeInTheDocument();
    expect(within(table).queryByText("Penilaian lengkap")).not.toBeInTheDocument();
  });

  it("turns chart animation off when the user requests reduced motion", async () => {
    useSuperadminAnalyticsHandlers();
    const previous = window.matchMedia;
    vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
    try {
      renderWithProviders(<SuperadminAnalyticsPageClient />);
      await screen.findByRole("table");
      expect(setOption.mock.calls.at(-1)?.[0].animation).toBe(false);
    } finally {
      vi.stubGlobal("matchMedia", previous);
    }
  });
});
