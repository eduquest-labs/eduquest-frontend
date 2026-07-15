import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AttemptTimer } from "@/components/attempts";

describe("AttemptTimer", () => {
  afterEach(() => vi.useRealTimers());

  it("memanggil expiry tepat sekali saat deadline tercapai", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-20T08:00:00+07:00"));
    const onExpire = vi.fn();
    render(<AttemptTimer deadlineAt="2026-07-20T08:00:02+07:00" stopped={false} onExpire={onExpire} />);
    expect(screen.getByText("00:02")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(3000));
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
