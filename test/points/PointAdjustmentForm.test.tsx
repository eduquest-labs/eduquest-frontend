import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PointAdjustmentForm } from "@/components/points-badges";

describe("PointAdjustmentForm", () => {
  it("memvalidasi input dan mengirim signed integer dengan reason", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<PointAdjustmentForm isPending={false} onSubmit={onSubmit} />);

    fireEvent.submit(screen.getByRole("button", { name: "Simpan koreksi" }).closest("form")!);
    expect(await screen.findByText("Jumlah poin wajib diisi.")).toBeInTheDocument();
    expect(screen.getByText("Alasan koreksi wajib diisi.")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Contoh: 20 atau -10"), {
      target: { value: "-15" },
    });
    fireEvent.change(screen.getByPlaceholderText("Jelaskan alasan perubahan poin"), {
      target: { value: "Koreksi nilai" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan koreksi" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        points: -15,
        reason: "Koreksi nilai",
      })
    );
  });
});
