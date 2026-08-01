import { fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "@heroui/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { KelasDetailPageClient } from "@/components/kelas/KelasDetailPageClient";
import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

const pushMock = vi.fn();
const originalCreateElement = document.createElement.bind(document);
let createdAnchors: HTMLAnchorElement[];
let downloadClick: ReturnType<typeof vi.spyOn>;

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
    createdAnchors = [];
    downloadClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.spyOn(document, "createElement").mockImplementation((tagName, options) => {
      const element = originalCreateElement(tagName, options);
      if (element instanceof HTMLAnchorElement) {
        createdAnchors.push(element);
      }

      return element;
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => "blob:grade-export"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: vi.fn(),
    });
  });
  afterEach(() => {
    clearToken();
    vi.restoreAllMocks();
  });

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

  it("mengekspor XLSX secara default dan memakai filename dari server", async () => {
    mockClassDetail();
    renderWithProviders(<KelasDetailPageClient classId={5} />);
    const exportButton = await screen.findByRole("button", { name: "Ekspor Data Nilai" });
    const get = vi.spyOn(client, "get").mockResolvedValueOnce({
      data: new Blob(["xlsx-content"]),
      headers: {
        "content-disposition": 'attachment; filename="nilai-ABCD1234-2026-07-29.xlsx"',
      },
    });

    fireEvent.click(exportButton);

    await waitFor(() => expect(downloadClick).toHaveBeenCalledOnce());
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.KELAS.EXPORT_GRADES(5), {
      params: { format: "xlsx", identity: "anonymous" },
      responseType: "blob",
    });
    expect(
      createdAnchors.find((anchor) => anchor.download === "nilai-ABCD1234-2026-07-29.xlsx")
    ).toBeDefined();
  });

  it("dapat memilih CSV dan menampilkan loading khusus tombol ekspor", async () => {
    mockClassDetail();
    let resolveExport: (() => void) | undefined;
    renderWithProviders(<KelasDetailPageClient classId={5} />);

    fireEvent.click(await screen.findByLabelText("Format ekspor data nilai"));
    fireEvent.click(await screen.findByRole("option", { name: "CSV" }));
    const get = vi.spyOn(client, "get").mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveExport = () =>
            resolve({
              data: new Blob(["csv-content"]),
              headers: { "content-disposition": 'attachment; filename="nilai.csv"' },
            });
        })
    );
    fireEvent.click(screen.getByRole("button", { name: "Ekspor Data Nilai" }));

    expect(await screen.findByRole("button", { name: "Menyiapkan file..." })).toBeDisabled();
    expect(get).toHaveBeenCalledWith(API_ENDPOINTS.KELAS.EXPORT_GRADES(5), {
      params: { format: "csv", identity: "anonymous" },
      responseType: "blob",
    });
    resolveExport?.();
    await waitFor(() => expect(downloadClick).toHaveBeenCalledOnce());
  });

  it("menampilkan toast granular saat ekspor gagal", async () => {
    mockClassDetail();
    const danger = vi.spyOn(toast, "danger").mockImplementation(() => "");

    renderWithProviders(<KelasDetailPageClient classId={5} />);
    const exportButton = await screen.findByRole("button", { name: "Ekspor Data Nilai" });
    vi.spyOn(client, "get").mockRejectedValueOnce(new Error("Export gagal"));

    fireEvent.click(exportButton);

    await waitFor(() =>
      expect(danger).toHaveBeenCalledWith("Data nilai gagal diekspor. Silakan coba lagi.")
    );
  });
});
