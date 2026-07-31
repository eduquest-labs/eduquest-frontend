import "fake-indexeddb/auto";

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePhysicalActivityRecorder } from "@/hooks/usePhysicalActivityRecorder";
import {
  clearPhysicalActivityQueue,
  listQueuedGpsPoints,
} from "@/services/physical-activity-queue";

const mutationMocks = vi.hoisted(() => ({
  start: vi.fn(),
  upload: vi.fn(),
  finish: vi.fn(),
}));

vi.mock("@/hooks/mutations", () => ({
  useStartPhysicalActivity: () => ({ mutateAsync: mutationMocks.start }),
  useUploadPhysicalActivityPoints: () => ({ mutateAsync: mutationMocks.upload }),
  useFinishPhysicalActivity: () => ({ mutateAsync: mutationMocks.finish }),
}));

const activity = {
  id: 7,
  challenge: { id: 3, title: "Lari pagi", type: "aktivitas_fisik" as const },
  student: { anonymousId: "STU-001" },
  startTime: "2026-07-31T01:00:00.000Z",
  endTime: null,
  distanceMeters: 0,
  durationSeconds: 0,
  averageSpeedKmh: null,
  status: "recording" as const,
  gpsPointsCount: 0,
  acceptedPointsCount: 0,
  createdAt: "2026-07-31T01:00:00.000Z",
};

function position(
  timestamp: number,
  accuracy: number,
  latitude: number
): GeolocationPosition {
  return {
    timestamp,
    coords: {
      latitude,
      longitude: 106.8,
      accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
      toJSON: () => ({}),
    },
    toJSON: () => ({}),
  };
}

describe("usePhysicalActivityRecorder", () => {
  let successCallback: PositionCallback;
  const clearWatch = vi.fn();

  beforeEach(async () => {
    await clearPhysicalActivityQueue();
    vi.clearAllMocks();
    mutationMocks.start.mockResolvedValue(activity);
    mutationMocks.upload.mockImplementation(async ({ points }) => ({
      acknowledgedClientPointIds: points.map(
        (point: { clientPointId: string }) => point.clientPointId
      ),
    }));
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        watchPosition: vi.fn((success: PositionCallback) => {
          successCallback = success;
          return 19;
        }),
        clearWatch,
      },
    });
  });

  it("meminta watchPosition dengan opsi outdoor dan memilih fix terbaik per detik", async () => {
    const { result, unmount } = renderHook(() =>
      usePhysicalActivityRecorder(3)
    );

    await act(async () => {
      await result.current.start();
    });

    expect(navigator.geolocation.watchPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    act(() => {
      successCallback(
        position(new Date("2026-07-31T01:00:00.000Z").getTime(), 20, -6.21)
      );
      successCallback(
        position(new Date("2026-07-31T01:00:00.500Z").getTime(), 5, -6.2)
      );
      successCallback(
        position(new Date("2026-07-31T01:00:01.100Z").getTime(), 10, -6.19)
      );
    });

    await waitFor(async () => {
      expect(await listQueuedGpsPoints(7)).toHaveLength(1);
    });

    const queued = await listQueuedGpsPoints(7);
    expect(queued[0]).toMatchObject({
      latitude: -6.2,
      accuracyMeters: 5,
    });

    unmount();
    expect(clearWatch).toHaveBeenCalledWith(19);
  });
});
