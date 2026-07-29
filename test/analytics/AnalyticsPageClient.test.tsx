import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { AnalyticsPageClient } from "@/components/analytics";
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
      class_id: 1,
      class_name: "Sekolah A",
      student_count: 18,
      locked_attempt_count: 24,
      scored_attempt_count: 20,
      average_score: 78.25,
      minimum_score: 40,
      maximum_score: 100,
      median_score: 80,
    },
    {
      class_id: 2,
      class_name: "Sekolah B",
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

function useAnalyticsHandlers() {
  server.use(
    http.get("*/api/auth/session", () =>
      HttpResponse.json({
        user: { id: "1", name: "Dosen", role: "dosen" },
        accessToken: "test-token",
        expires: "2099-01-01T00:00:00.000Z",
      })
    ),
    http.get("*/dosen/class-comparison", () =>
      HttpResponse.json(response)
    )
  );
}

describe("AnalyticsPageClient", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  it("menampilkan loading granular lalu chart dan detail final versus pending", async () => {
    useAnalyticsHandlers();

    renderWithProviders(<AnalyticsPageClient />);

    expect(
      screen.getByLabelText("Memuat perbandingan kelas")
    ).toBeInTheDocument();
    expect(await screen.findByText("Sekolah A")).toBeInTheDocument();
    expect(screen.getByText("Sekolah B")).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Perbandingan rata-rata skor mentah final per kelas",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", {
        name: "Distribusi minimum, maksimum, dan median skor mentah final per kelas",
      })
    ).toBeInTheDocument();
    expect(screen.getByText("78,25")).toBeInTheDocument();
    expect(screen.getByText("2 pending")).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(4);
    expect(setOption).toHaveBeenCalledTimes(2);
  });

  it("membedakan empty class dan belum ada skor final", async () => {
    useAnalyticsHandlers();
    server.use(
      http.get("*/dosen/class-comparison", () =>
        HttpResponse.json({ data: [] })
      )
    );
    const view = renderWithProviders(<AnalyticsPageClient />);

    expect(await screen.findByText("Belum ada kelas")).toBeInTheDocument();

    view.unmount();
    useAnalyticsHandlers();
    server.use(
      http.get("*/dosen/class-comparison", () =>
        HttpResponse.json({ data: [response.data[1]] })
      )
    );
    renderWithProviders(<AnalyticsPageClient />);

    expect(
      await screen.findByText(/Belum ada skor final/)
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("menampilkan error granular dengan aksi retry", async () => {
    useAnalyticsHandlers();
    server.use(
      http.get("*/dosen/class-comparison", () =>
        HttpResponse.json({ message: "Server error" }, { status: 500 })
      )
    );

    renderWithProviders(<AnalyticsPageClient />);

    expect(
      await screen.findByText(
        "Perbandingan kelas gagal dimuat.",
        {},
        { timeout: 10_000 }
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Coba lagi" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Perbandingan menggunakan skor mentah/)).toBeInTheDocument();
  });
});
