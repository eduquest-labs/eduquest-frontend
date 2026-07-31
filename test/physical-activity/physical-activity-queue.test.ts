import "fake-indexeddb/auto";

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  acknowledgeGpsPoints,
  clearPhysicalActivityQueue,
  countQueuedGpsPoints,
  enqueueGpsPoint,
  listQueuedGpsPoints,
  purgeExpiredGpsPoints,
} from "@/services/physical-activity-queue";

describe("physical activity IndexedDB queue", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    await clearPhysicalActivityQueue();
    vi.useRealTimers();
  });

  it("mengisolasi queue per activity dan menghapus hanya UUID yang di-ACK", async () => {
    await enqueueGpsPoint(7, {
      clientPointId: "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
      latitude: -6.2,
      longitude: 106.8,
      accuracyMeters: 5,
      recordedAt: "2026-07-31T01:00:00.000Z",
    });
    await enqueueGpsPoint(8, {
      clientPointId: "e8d28f4b-59fd-4f31-b835-28028949f90e",
      latitude: -6.3,
      longitude: 106.9,
      accuracyMeters: 7,
      recordedAt: "2026-07-31T01:00:01.000Z",
    });

    expect(await countQueuedGpsPoints(7)).toBe(1);
    expect(await listQueuedGpsPoints(8)).toHaveLength(1);

    await acknowledgeGpsPoints(7, [
      "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
    ]);

    expect(await countQueuedGpsPoints(7)).toBe(0);
    expect(await countQueuedGpsPoints(8)).toBe(1);
  });

  it("menghapus queue yang melewati TTL tanpa menyentuh point baru", async () => {
    vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(3000);
    await enqueueGpsPoint(7, {
      clientPointId: "06bb86d8-2f92-4df7-988f-3adfc23c59b1",
      latitude: 0,
      longitude: 0,
      accuracyMeters: 5,
      recordedAt: "2026-07-31T01:00:00.000Z",
    });
    await enqueueGpsPoint(7, {
      clientPointId: "e8d28f4b-59fd-4f31-b835-28028949f90e",
      latitude: 0,
      longitude: 0,
      accuracyMeters: 5,
      recordedAt: "2026-07-31T01:00:01.000Z",
    });

    await purgeExpiredGpsPoints(2000);

    const remaining = await listQueuedGpsPoints(7);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].clientPointId).toBe(
      "e8d28f4b-59fd-4f31-b835-28028949f90e"
    );
  });
});
