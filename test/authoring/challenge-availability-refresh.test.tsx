import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useChallengeAvailabilityRefresh } from "@/hooks/queries/useChallengeAvailabilityRefresh";
import type { Challenge, ChallengeAvailability } from "@/types";

function challenge(
  availabilityStatus: ChallengeAvailability,
  startTime: string | null,
  endTime: string | null,
  isPublished = true
): Challenge {
  return {
    id: 1,
    topicId: 1,
    title: "Kuis",
    description: null,
    type: "kuis",
    pointsReward: 10,
    startTime,
    endTime,
    timerSeconds: null,
    isPublished,
    availabilityStatus,
    createdAt: "a",
    updatedAt: "a",
  };
}

describe("useChallengeAvailabilityRefresh", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T00:45:00+07:00"));
  });

  afterEach(() => vi.useRealTimers());

  it("memakai satu timer untuk boundary terdekat lalu menjadwalkan boundary berikutnya", async () => {
    const refetch = vi.fn();
    const scheduled = challenge(
      "scheduled",
      "2026-07-15T00:50:00+07:00",
      "2026-07-15T01:00:00+07:00"
    );
    const later = { ...scheduled, id: 2, startTime: "2026-07-15T02:00:00+07:00" };
    const { rerender, unmount } = renderHook(
      ({ challenges }) => useChallengeAvailabilityRefresh(challenges, refetch),
      { initialProps: { challenges: [scheduled, later] } }
    );

    expect(vi.getTimerCount()).toBe(1);

    await act(async () => vi.advanceTimersByTime(5 * 60 * 1000 + 250));
    expect(refetch).toHaveBeenCalledTimes(1);

    rerender({ challenges: [{ ...scheduled, availabilityStatus: "active" }] });
    expect(vi.getTimerCount()).toBe(1);

    await act(async () => vi.advanceTimersByTime(10 * 60 * 1000));
    expect(refetch).toHaveBeenCalledTimes(2);

    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("tidak memasang timer untuk draft atau jadwal yang sudah selesai", () => {
    const refetch = vi.fn();
    const { unmount } = renderHook(() => useChallengeAvailabilityRefresh([
      challenge("draft", "2026-07-15T00:50:00+07:00", null, false),
      challenge("ended", "2026-07-15T00:30:00+07:00", "2026-07-15T00:40:00+07:00"),
    ], refetch));

    expect(vi.getTimerCount()).toBe(0);
    unmount();
  });
});
