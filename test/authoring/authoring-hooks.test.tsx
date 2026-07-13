import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useDuplicateChallenge } from "@/hooks/mutations";
import { authoringKeys } from "@/hooks/queries";
import { createQueryClient } from "@/lib/query-client";
import * as authoringService from "@/services/modules/authoring.service";

vi.mock("@/services/modules/authoring.service", async (importOriginal) => {
  const actual = await importOriginal<typeof authoringService>();
  return { ...actual, duplicateChallenge: vi.fn() };
});

describe("authoring mutation cache", () => {
  beforeEach(() => vi.clearAllMocks());

  it("menginvalidasi challenge pada target topic setelah duplicate", async () => {
    vi.mocked(authoringService.duplicateChallenge).mockResolvedValue({
      id: 20, topicId: 8, title: "Salinan", description: null, type: "kuis",
      pointsReward: 0, startTime: null, endTime: null, timerSeconds: null,
      isPublished: false, createdAt: "a", updatedAt: "a", questions: [],
    });
    const queryClient = createQueryClient();
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useDuplicateChallenge(), { wrapper });

    await act(() => result.current.mutateAsync({ challengeId: 3, targetTopicId: 8 }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: authoringKeys.challenges(8) });
  });
});
