import { fireEvent, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, expect, it } from "vitest";
import { GuruPageClient } from "@/components/superadmin-guru/GuruPageClient";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { setToken, clearToken } from "@/services/token-store";

beforeEach(() => {
  setToken("test-token");
  server.use(
    http.get("*/schools", () => HttpResponse.json({ data: [{ id: 1, name: "SMA Bandung" }] })),
    http.get("*/superadmin/analytics/guru", () => HttpResponse.json({ data: [
      { guru_id: 1, guru_name: "Bu Sari", school_name: "SMA Bandung", class_count: 3, student_count: 40 },
      { guru_id: 2, guru_name: "Pak Budi", school_name: "SMA Bandung", class_count: 1, student_count: 10 },
    ] })),
    http.get("*/guru", () => HttpResponse.json({ data: [
      { id: 1, name: "Bu Sari", email: "sari@example.com", school_id: 1, is_active: true },
      { id: 2, name: "Pak Budi", email: "budi@example.com", school_id: 1, is_active: false },
    ] })),
  );
});
afterEach(clearToken);

it("combines teacher search and status while retaining the right account action", async () => {
  renderWithProviders(<GuruPageClient />);
  const table = await screen.findByRole("grid", { name: "Daftar guru" });
  fireEvent.click(screen.getByRole("button", { name: /Status akun/ }));
  fireEvent.click(await screen.findByRole("option", { name: "Nonaktif" }));
  expect(within(table).queryByText("Bu Sari")).not.toBeInTheDocument();
  expect(within(table).getByRole("button", { name: /Aktifkan/ })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox", { name: "Cari guru" }), { target: { value: "sari" } });
  expect(screen.getByText("Tidak ada guru yang sesuai")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Reset filter" }));
  expect(await screen.findByText("Bu Sari")).toBeInTheDocument();
});
