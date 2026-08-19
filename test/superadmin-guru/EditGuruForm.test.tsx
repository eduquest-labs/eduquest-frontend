import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EditGuruForm } from "@/components/superadmin-guru";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

function mockSchoolsList() {
  server.use(
    http.get("*/schools", () =>
      HttpResponse.json({ data: [{ id: 1, name: "SMA Negeri 1 Bandung" }, { id: 2, name: "SMA Negeri 2 Bandung" }] })
    )
  );
}

describe("EditGuruForm", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("submits updated name and email with the unchanged school and calls onUpdated", async () => {
    mockSchoolsList();
    server.use(
      http.patch("*/guru/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Bu Sari Baru", email: "sari2@example.com", school_id: 1 });
        return HttpResponse.json({ id: 5, name: "Bu Sari Baru", email: "sari2@example.com", school_id: 1 });
      })
    );
    const onUpdated = vi.fn();

    renderWithProviders(
      <EditGuruForm
        guru={{ id: 5, name: "Bu Sari", email: "sari@example.com", schoolId: 1 }}
        onUpdated={onUpdated}
      />
    );

    fireEvent.change(screen.getByLabelText("Nama"), { target: { value: "Bu Sari Baru" } });
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "sari2@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan perubahan/i }));

    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
  });
});
