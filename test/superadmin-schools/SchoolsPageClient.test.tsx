import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SchoolsPageClient } from "@/components/superadmin-schools";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

function mockSchoolsList() {
  server.use(
    http.get("*/superadmin/analytics/schools", () =>
      HttpResponse.json({
        data: [
          {
            school_id: 1,
            school_name: "SMA Negeri 1 Bandung",
            guru_count: 2,
            class_count: 4,
            student_count: 60,
          },
        ],
      })
    )
  );
}

describe("SchoolsPageClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken("test-access-token");
  });
  afterEach(clearToken);

  it("renders the schools table with stats from the analytics endpoint", async () => {
    mockSchoolsList();
    renderWithProviders(<SchoolsPageClient />);

    expect(await screen.findByText("SMA Negeri 1 Bandung")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens the create modal, submits, and shows the new school in the table", async () => {
    mockSchoolsList();
    server.use(
      http.post("*/schools", () => {
        server.use(
          http.get("*/superadmin/analytics/schools", () =>
            HttpResponse.json({
              data: [
                {
                  school_id: 1,
                  school_name: "SMA Negeri 1 Bandung",
                  guru_count: 2,
                  class_count: 4,
                  student_count: 60,
                },
                {
                  school_id: 2,
                  school_name: "SMA Negeri 2 Bandung",
                  guru_count: 0,
                  class_count: 0,
                  student_count: 0,
                },
              ],
            })
          )
        );
        return HttpResponse.json({ id: 2, name: "SMA Negeri 2 Bandung" }, { status: 201 });
      })
    );
    renderWithProviders(<SchoolsPageClient />);
    await screen.findByText("SMA Negeri 1 Bandung");

    fireEvent.click(screen.getByRole("button", { name: /tambah sekolah/i }));
    fireEvent.change(await screen.findByLabelText("Nama Sekolah"), {
      target: { value: "SMA Negeri 2 Bandung" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buat Sekolah" }));

    await waitFor(() => expect(screen.getByText("SMA Negeri 2 Bandung")).toBeInTheDocument());
  });

  it("deletes a school after confirmation", async () => {
    mockSchoolsList();
    server.use(
      http.delete("*/schools/1", () => {
        server.use(http.get("*/superadmin/analytics/schools", () => HttpResponse.json({ data: [] })));
        return new HttpResponse(null, { status: 204 });
      })
    );
    renderWithProviders(<SchoolsPageClient />);
    await screen.findByText("SMA Negeri 1 Bandung");

    fireEvent.click(screen.getByRole("button", { name: /hapus/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus" }));

    await waitFor(() =>
      expect(screen.queryByText("SMA Negeri 1 Bandung")).not.toBeInTheDocument()
    );
  });

  it(
    "shows an error state with retry when the list fails to load",
    async () => {
      server.use(
        http.get("*/superadmin/analytics/schools", () =>
          HttpResponse.json({ message: "Server error" }, { status: 500 })
        )
      );
      renderWithProviders(<SchoolsPageClient />);

      expect(
        await screen.findByText("Gagal memuat daftar sekolah.", {}, { timeout: 10_000 })
      ).toBeInTheDocument();
    },
    15_000
  );
});
