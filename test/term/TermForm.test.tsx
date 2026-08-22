import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TermForm } from "@/components/term";

describe("TermForm", () => {
  it("submits with parsed values", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<TermForm isPending={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nama termin"), { target: { value: "Termin 1" } });
    fireEvent.change(screen.getByLabelText("Threshold kelulusan (%)"), { target: { value: "60" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat termin" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ name: "Termin 1", thresholdPercent: 60 });
  });

  it("rejects a threshold above 100", async () => {
    const onSubmit = vi.fn();
    render(<TermForm isPending={false} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("Nama termin"), { target: { value: "Termin 1" } });
    fireEvent.change(screen.getByLabelText("Threshold kelulusan (%)"), { target: { value: "150" } });
    fireEvent.click(screen.getByRole("button", { name: "Buat termin" }));

    await waitFor(() => expect(screen.getByText(/antara 0-100/)).toBeInTheDocument());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
