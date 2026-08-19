import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CreateSchoolForm } from "@/components/superadmin-schools";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/helpers/render";
import { clearToken, setToken } from "@/services/token-store";

describe("CreateSchoolForm", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("submits the trimmed name and calls onCreated with the new school", async () => {
    server.use(
      http.post("*/schools", async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>;
        expect(body).toEqual({ name: "SMA Negeri 6 Bandung" });
        return HttpResponse.json({ id: 6, name: "SMA Negeri 6 Bandung" }, { status: 201 });
      })
    );
    const onCreated = vi.fn();

    renderWithProviders(<CreateSchoolForm onCreated={onCreated} />);

    fireEvent.change(screen.getByLabelText("Nama Sekolah"), {
      target: { value: "SMA Negeri 6 Bandung" },
    });
    fireEvent.click(screen.getByRole("button", { name: /buat sekolah/i }));

    await waitFor(() =>
      expect(onCreated).toHaveBeenCalledWith({ id: 6, name: "SMA Negeri 6 Bandung" })
    );
  });

  it("shows a field error when the name is empty", async () => {
    renderWithProviders(<CreateSchoolForm onCreated={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: /buat sekolah/i }));

    expect(await screen.findByText("Nama sekolah wajib diisi")).toBeInTheDocument();
  });

  it("shows a server validation error on 422", async () => {
    server.use(
      http.post("*/schools", () =>
        HttpResponse.json(
          { message: "The given data was invalid.", errors: { name: ["Nama sekolah sudah dipakai."] } },
          { status: 422 }
        )
      )
    );

    renderWithProviders(<CreateSchoolForm onCreated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Nama Sekolah"), {
      target: { value: "SMA Negeri 1 Bandung" },
    });
    fireEvent.click(screen.getByRole("button", { name: /buat sekolah/i }));

    expect(await screen.findByText("Nama sekolah sudah dipakai.")).toBeInTheDocument();
  });
});
