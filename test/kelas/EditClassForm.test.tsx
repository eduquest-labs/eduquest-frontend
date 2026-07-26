import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { EditClassForm } from "@/components/kelas/EditClassForm";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";

describe("EditClassForm", () => {
  it("menampilkan nama kelas saat ini di field", () => {
    renderWithProviders(<EditClassForm classId={5} currentName="Kelas Lama" onUpdated={vi.fn()} />);

    expect(screen.getByRole("textbox", { name: "Nama Kelas" })).toHaveValue("Kelas Lama");
  });

  it("mengirim update dan memanggil onUpdated saat sukses", async () => {
    const onUpdated = vi.fn();
    server.use(
      http.patch("*/classes/5", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "Kelas Baru" });
        return HttpResponse.json({
          id: 5,
          name: "Kelas Baru",
          class_code: "ABCD1234",
          student_count: 0,
          created_at: "2026-07-13",
        });
      })
    );

    renderWithProviders(<EditClassForm classId={5} currentName="Kelas Lama" onUpdated={onUpdated} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Nama Kelas" }), {
      target: { value: "Kelas Baru" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
  });

  it("menampilkan error field saat nama dikosongkan", async () => {
    renderWithProviders(<EditClassForm classId={5} currentName="Kelas Lama" onUpdated={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Nama Kelas" }), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    expect(await screen.findByText(/nama kelas wajib diisi/i)).toBeInTheDocument();
  });

  it("menampilkan pesan error dari server saat validasi 422", async () => {
    server.use(
      http.patch("*/classes/5", () =>
        HttpResponse.json(
          { message: "The given data was invalid.", errors: { name: ["Nama kelas sudah digunakan."] } },
          { status: 422 }
        )
      )
    );

    renderWithProviders(<EditClassForm classId={5} currentName="Kelas Lama" onUpdated={vi.fn()} />);

    fireEvent.change(screen.getByRole("textbox", { name: "Nama Kelas" }), {
      target: { value: "Kelas Duplikat" },
    });
    fireEvent.click(screen.getByRole("button", { name: /simpan/i }));

    expect(await screen.findByText("Nama kelas sudah digunakan.")).toBeInTheDocument();
  });
});
