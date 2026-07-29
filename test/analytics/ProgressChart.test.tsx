import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { ProgressChart } from "@/components/analytics";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

const setOption = vi.fn();

vi.mock("echarts/core", () => ({
  init: vi.fn(() => ({
    setOption,
    resize: vi.fn(),
    dispose: vi.fn(),
  })),
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

describe("ProgressChart", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  it("menampilkan progres kelas lalu memfilter siswa hanya dengan ID anonim", async () => {
    const studentFilters: Array<string | null> = [];
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/classes/1/students", () =>
        HttpResponse.json({
          data: [
            {
              id: 11,
              student_id: 27,
              anonymous_id: "01ANONYMOUSSTUDENT00000001",
              name: "Nama Rahasia",
              nis: "2001",
              is_claimed: true,
              joined_at: "2026-07-01T08:00:00+07:00",
            },
          ],
        })
      ),
      http.get("*/classes/1/progress-chart", ({ request }) => {
        const studentId = new URL(request.url).searchParams.get("student_id");
        studentFilters.push(studentId);

        return HttpResponse.json({
          data:
            studentId === null
              ? [
                  {
                    finished_at: "2026-07-01T08:00:00+07:00",
                    average_score: 75,
                    challenge_title: "Pre-test",
                  },
                ]
              : [
                  {
                    finished_at: "2026-07-02T08:00:00+07:00",
                    score: 90,
                    challenge_title: "Post-test",
                  },
                ],
        });
      })
    );

    renderWithProviders(
      <ProgressChart
        classes={[
          { classId: 1, className: "Sekolah A" },
          { classId: 2, className: "Sekolah B" },
        ]}
      />
    );

    expect(
      await screen.findByRole("img", {
        name: "Progres rata-rata skor mentah kelas dari waktu ke waktu",
      })
    ).toBeInTheDocument();
    expect(screen.queryByText("Nama Rahasia")).not.toBeInTheDocument();
    expect(screen.queryByText("2001")).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Pilih mode progres siswa"));
    fireEvent.click(
      await screen.findByRole("option", {
        name: "01ANONYMOUSSTUDENT00000001",
      })
    );

    await waitFor(() => expect(studentFilters).toEqual([null, "27"]));
    expect(
      await screen.findByRole("img", {
        name: "Progres skor mentah siswa dari waktu ke waktu",
      })
    ).toBeInTheDocument();
    expect(screen.getByTestId("progress-chart-scroller")).toHaveClass(
      "overflow-x-auto"
    );
    expect(screen.getByTestId("progress-chart-canvas")).toHaveStyle({
      minWidth: "100%",
      width: "640px",
    });
  });

  it("menampilkan empty dan error state secara granular", async () => {
    server.use(
      http.get("*/api/auth/session", () => HttpResponse.json({})),
      http.get("*/classes/1/students", () => HttpResponse.json({ data: [] })),
      http.get("*/classes/1/progress-chart", () =>
        HttpResponse.json({ data: [] })
      )
    );
    const view = renderWithProviders(
      <ProgressChart classes={[{ classId: 1, className: "Sekolah A" }]} />
    );

    expect(
      await screen.findByText("Belum ada skor final untuk pilihan ini.")
    ).toBeInTheDocument();

    view.unmount();
    server.use(
      http.get("*/classes/1/progress-chart", () =>
        HttpResponse.json({ message: "Gagal" }, { status: 500 })
      )
    );
    renderWithProviders(
      <ProgressChart classes={[{ classId: 1, className: "Sekolah A" }]} />
    );

    expect(
      await screen.findByText("Grafik progres gagal dimuat.", undefined, {
        timeout: 10_000,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Coba lagi" })
    ).toBeInTheDocument();
  });
});
