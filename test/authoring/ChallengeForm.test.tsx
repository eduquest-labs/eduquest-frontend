import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ChallengeForm } from "@/components/authoring/ChallengeForm";

describe("ChallengeForm", () => {
  it("includes isGroupChallenge in submitted payload when toggled on", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ChallengeForm isPending={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Judul challenge"), { target: { value: "Lomba Kelompok" } });
    fireEvent.click(screen.getByRole("switch", { name: "Challenge kelompok" }));
    fireEvent.click(screen.getByRole("button", { name: "Buat challenge" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ isGroupChallenge: true });
  });

  it("hides the group challenge toggle for aktivitas_fisik type", () => {
    render(<ChallengeForm isPending={false} onSubmit={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Tipe"), { target: { value: "aktivitas_fisik" } });

    expect(screen.queryByRole("switch", { name: "Challenge kelompok" })).not.toBeInTheDocument();
  });
});
