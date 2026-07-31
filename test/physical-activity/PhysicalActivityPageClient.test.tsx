import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PhysicalActivityPageClient } from "@/components/physical-activity";
import { renderWithProviders } from "@/test/helpers/render";

const recorderMock = vi.hoisted(() => vi.fn());
const routeMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/usePhysicalActivityRecorder", () => ({
  usePhysicalActivityRecorder: recorderMock,
}));
vi.mock("@/hooks/queries", () => ({
  usePhysicalActivityRoute: routeMock,
}));
vi.mock("@/components/physical-activity/PhysicalActivityMapShell", () => ({
  PhysicalActivityMapShell: () => <div aria-label="Peta rute aktivitas" />,
}));

const idleRecorder = {
  status: "idle",
  failure: null,
  errorMessage: null,
  activity: null,
  livePoints: [],
  queuedPointCount: 0,
  recordedPointCount: 0,
  elapsedSeconds: 0,
  isOnline: true,
  start: vi.fn(),
  finish: vi.fn(),
  retrySync: vi.fn(),
};

describe("PhysicalActivityPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    recorderMock.mockReturnValue(idleRecorder);
    routeMock.mockReturnValue({ data: undefined, isLoading: false });
  });

  it("meminta izin hanya setelah siswa menekan mulai", () => {
    renderWithProviders(<PhysicalActivityPageClient challengeId={3} />);

    expect(idleRecorder.start).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Mulai merekam" }));
    expect(idleRecorder.start).toHaveBeenCalledOnce();
    expect(screen.getByText(/Izin lokasi baru diminta/)).toBeInTheDocument();
  });

  it("menampilkan permission denied secara jelas dan dapat dicoba ulang", () => {
    recorderMock.mockReturnValue({
      ...idleRecorder,
      status: "error",
      failure: "permission_denied",
      errorMessage:
        "Izin lokasi ditolak. Aktifkan izin lokasi browser untuk merekam aktivitas.",
    });

    renderWithProviders(<PhysicalActivityPageClient challengeId={3} />);

    expect(screen.getAllByText(/Izin lokasi ditolak/)).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));
    expect(idleRecorder.start).toHaveBeenCalledOnce();
  });

  it("menampilkan ringkasan completed dan rute hasil", () => {
    recorderMock.mockReturnValue({
      ...idleRecorder,
      status: "completed",
      activity: {
        id: 7,
        challenge: {
          id: 3,
          title: "Lari pagi",
          type: "aktivitas_fisik",
        },
        student: { anonymousId: "STU-001" },
        startTime: "2026-07-31T01:00:00.000Z",
        endTime: "2026-07-31T01:10:00.000Z",
        distanceMeters: 1500,
        durationSeconds: 600,
        averageSpeedKmh: 9,
        status: "completed",
        gpsPointsCount: 601,
        acceptedPointsCount: 590,
        createdAt: "2026-07-31T01:00:00.000Z",
      },
    });
    routeMock.mockReturnValue({
      data: {
        points: [{
          latitude: -6.2,
          longitude: 106.8,
          recordedAt: "2026-07-31T01:00:00.000Z",
        }],
      },
      isLoading: false,
    });

    renderWithProviders(<PhysicalActivityPageClient challengeId={3} />);

    expect(screen.getByText("1.50 km")).toBeInTheDocument();
    expect(screen.getByText("00:10:00")).toBeInTheDocument();
    expect(screen.getByLabelText("Peta rute aktivitas")).toBeInTheDocument();
  });

  it("menjelaskan bahwa rute invalid adalah jejak GPS mentah", () => {
    recorderMock.mockReturnValue({
      ...idleRecorder,
      status: "invalid",
      activity: {
        id: 8,
        challenge: {
          id: 3,
          title: "Lari pagi",
          type: "aktivitas_fisik",
        },
        student: { anonymousId: "STU-001" },
        startTime: "2026-07-31T01:00:00.000Z",
        endTime: "2026-07-31T01:10:00.000Z",
        distanceMeters: 0,
        durationSeconds: 600,
        averageSpeedKmh: 0,
        status: "invalid",
        gpsPointsCount: 15,
        acceptedPointsCount: 0,
        createdAt: "2026-07-31T01:00:00.000Z",
      },
    });
    routeMock.mockReturnValue({
      data: {
        points: [
          {
            latitude: -6.2,
            longitude: 106.8,
            recordedAt: "2026-07-31T01:00:00.000Z",
          },
        ],
      },
      isLoading: false,
    });

    renderWithProviders(<PhysicalActivityPageClient challengeId={3} />);

    expect(screen.getByText("Aktivitas tidak valid")).toBeInTheDocument();
    expect(
      screen.getByText(/Garis putus-putus menampilkan jejak GPS mentah/)
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Peta rute aktivitas")).toBeInTheDocument();
  });
});
