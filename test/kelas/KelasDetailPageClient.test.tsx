import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KelasDetailPageClient } from "@/components/kelas/KelasDetailPageClient";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

function mockClassDetail() {
  server.use(
    http.get("*/classes/5", () =>
      HttpResponse.json({
        id: 5,
        name: "Kelas Lama",
        class_code: "ABCD1234",
        student_count: 2,
        created_at: "2026-07-13",
      })
    ),
    http.get("*/classes/5/students", () => HttpResponse.json({ data: [] }))
  );
}

describe("KelasDetailPageClient — edit & delete kelas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setToken("test-access-token");
  });
  afterEach(clearToken);

  it("membuka modal edit terisi nama saat ini dan memperbarui nama setelah submit", async () => {
    mockClassDetail();
    server.use(
      http.patch("*/classes/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Kelas Baru" });
        return HttpResponse.json({
          id: 5,
          name: "Kelas Baru",
          class_code: "ABCD1234",
          student_count: 2,
          created_at: "2026-07-13",
        });
      })
    );

    renderWithProviders(<KelasDetailPageClient classId={5} />);

    fireEvent.click(await screen.findByRole("button", { name: /edit/i }));

    const input = await screen.findByRole("textbox", { name: "Nama Kelas" });
    expect(input).toHaveValue("Kelas Lama");

    fireEvent.change(input, { target: { value: "Kelas Baru" } });
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Nama Kelas" })).not.toBeInTheDocument());
  });

  it("menghapus kelas setelah konfirmasi dan redirect ke /dosen/kelas", async () => {
    mockClassDetail();
    server.use(http.delete("*/classes/5", () => new HttpResponse(null, { status: 204 })));

    renderWithProviders(<KelasDetailPageClient classId={5} />);

    fireEvent.click(await screen.findByRole("button", { name: /hapus/i }));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/dosen/kelas"));
  });

  it("tetap menampilkan skeleton/error state seperti semula saat data belum siap", () => {
    server.use(
      http.get("*/classes/5", () => new Promise(() => {})),
      http.get("*/classes/5/students", () => HttpResponse.json({ data: [] }))
    );

    renderWithProviders(<KelasDetailPageClient classId={5} />);

    expect(screen.queryByRole("button", { name: /edit/i })).not.toBeInTheDocument();
  });
});
