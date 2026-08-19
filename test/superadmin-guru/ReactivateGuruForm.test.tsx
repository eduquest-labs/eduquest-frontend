import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReactivateGuruForm } from "@/components/superadmin-guru";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

describe("ReactivateGuruForm", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("submits the new password and calls onReactivated", async () => {
    server.use(
      http.patch("*/guru/5/reactivate", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ password: "newpass123", password_confirmation: "newpass123" });
        return HttpResponse.json({ id: 5, name: "Bu Sari", email: "sari@example.com", school_id: 1, is_active: true });
      })
    );
    const onReactivated = vi.fn();

    renderWithProviders(<ReactivateGuruForm guruId={5} onReactivated={onReactivated} />);

    fireEvent.change(screen.getByLabelText("Kata Sandi Baru"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Ulangi Kata Sandi Baru"), {
      target: { value: "newpass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aktifkan/i }));

    await waitFor(() => expect(onReactivated).toHaveBeenCalled());
  });

  it("shows a field error when passwords don't match", async () => {
    renderWithProviders(<ReactivateGuruForm guruId={5} onReactivated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Kata Sandi Baru"), {
      target: { value: "newpass123" },
    });
    fireEvent.change(screen.getByLabelText("Ulangi Kata Sandi Baru"), {
      target: { value: "different" },
    });
    fireEvent.click(screen.getByRole("button", { name: /aktifkan/i }));

    expect(await screen.findByText("Konfirmasi kata sandi tidak cocok")).toBeInTheDocument();
  });
});
