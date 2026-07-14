import { useEffect } from "react";

import type { Challenge } from "@/types";

const TIMER_BOUNDARY_BUFFER_MS = 250;
const MAX_TIMER_DELAY_MS = 2_147_000_000;

function nearestFutureBoundary(challenges: Challenge[], now: number): number | null {
  let nearest: number | null = null;

  for (const challenge of challenges) {
    if (!challenge.isPublished) continue;

    for (const value of [challenge.startTime, challenge.endTime]) {
      if (!value) continue;

      const boundary = Date.parse(value);
      if (!Number.isFinite(boundary) || boundary <= now) continue;

      nearest = nearest === null ? boundary : Math.min(nearest, boundary);
    }
  }

  return nearest;
}

export function useChallengeAvailabilityRefresh(
  challenges: Challenge[] | undefined,
  refetch: () => unknown
) {
  useEffect(() => {
    if (!challenges?.length) return;

    const now = Date.now();
    const boundary = nearestFutureBoundary(challenges, now);
    if (boundary === null) return;

    let timeoutId: number;

    const scheduleBoundary = () => {
      const remaining = boundary - Date.now() + TIMER_BOUNDARY_BUFFER_MS;
      const delay = Math.min(remaining, MAX_TIMER_DELAY_MS);

      timeoutId = window.setTimeout(() => {
        if (remaining > MAX_TIMER_DELAY_MS) {
          scheduleBoundary();
          return;
        }

        void refetch();
      }, delay);
    };

    scheduleBoundary();

    return () => window.clearTimeout(timeoutId);
  }, [challenges, refetch]);
}
