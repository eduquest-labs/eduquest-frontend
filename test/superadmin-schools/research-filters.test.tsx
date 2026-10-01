import { fireEvent, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, expect, it } from "vitest";
import { SchoolsPageClient } from "@/components/superadmin-schools/SchoolsPageClient";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { setToken, clearToken } from "@/services/token-store";

beforeEach(() => {
  setToken("test-token");
  server.use(http.get("*/superadmin/analytics/schools", () => HttpResponse.json({ data: [
    { school_id: 1, school_name: "SMA Bandung", guru_count: 2, class_count: 3, student_count: 40 },
    { school_id: 2, school_name: "SMA Sumedang", guru_count: 0, class_count: 0, student_count: 0 },
  ] })));
});
afterEach(clearToken);

it("searches schools, marks absent coverage, and keeps management actions", async () => {
  renderWithProviders(<SchoolsPageClient />);
  const table = await screen.findByRole("grid", { name: "Daftar sekolah" });
  expect(within(table).getByText("Belum ada siswa")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox", { name: "Cari sekolah" }), { target: { value: "bandung" } });
  expect(within(table).queryByText("SMA Sumedang")).not.toBeInTheDocument();
  expect(within(table).getByRole("button", { name: /Edit/ })).toBeInTheDocument();
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "xyz" } });
  expect(screen.getByText("Tidak ada sekolah yang sesuai")).toBeInTheDocument();
  expect(screen.queryByText("Belum ada sekolah")).not.toBeInTheDocument();
});
