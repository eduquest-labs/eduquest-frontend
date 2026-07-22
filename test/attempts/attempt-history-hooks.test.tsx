import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { attemptKeys, useAttemptHistory } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import { server } from "@/test/msw/server";
import { clearToken } from "@/services/token-store";

function historyItem(id: number) {
  return {
    id,
    challenge: { id: 1, title: `Kuis ${id}` },
    topic: { id: 3, name: "Kebugaran" },
    class: { id: 2, name: "Kelas A" },
    started_at: "2026-07-20T08:00:00+07:00",
    finished_at: null,
    is_locked: false,
    total_score: null,
    grading_status: "complete" as const,
  };
}

describe("attempt history query", () => {
  beforeEach(() => {
    clearToken();
    server.use(http.get("*/api/auth/session", () => HttpResponse.json({ accessToken: "test-token" })));
  });

  it("memisahkan cache berdasarkan filter dan mengambil cursor berikutnya", async () => {
    const requestedCursors: Array<string | null> = [];
    server.use(http.get("*/students/me/attempts", ({ request }) => {
      const params = new URL(request.url).searchParams;
      requestedCursors.push(params.get("cursor"));
      expect(params.get("class_id")).toBe("2");
      expect(params.get("topic_id")).toBe("3");

      return params.get("cursor") === "next-token"
        ? HttpResponse.json({ data: [historyItem(2)], next_cursor: null, prev_cursor: "previous" })
        : HttpResponse.json({ data: [historyItem(1)], next_cursor: "next-token", prev_cursor: null });
    }));
    const queryClient = createQueryClient();
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const filters = { classId: 2, topicId: 3 };
    const { result } = renderHook(() => useAttemptHistory(filters), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(attemptKeys.history(filters))).toBeDefined();
    expect(result.current.hasNextPage).toBe(true);

    await act(async () => {
      await result.current.fetchNextPage();
    });
    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2));

    expect(requestedCursors).toEqual([null, "next-token"]);
    expect(result.current.data?.pages.flatMap((page) => page.data.map((item) => item.id)))
      .toEqual([1, 2]);
    expect(result.current.hasNextPage).toBe(false);
  });
});
