import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/helpers/render";
import { BankMaterialForm } from "@/components/activity-bank/BankMaterialForm";
const read = vi.hoisted(() => vi.fn());
vi.mock("@/services/modules/bank-document-import.service", () => ({ extractBankDocument: read, MAX_DOCUMENT_TEXT: 20000 }));
const folders = [{ id: 2, name: "Gerak", parentId: null, collection: "private" as const, ownerId: 3, materialCount: 0 }];
describe("document import review", () => {
  it("keeps edits until explicit apply and save, appending instead of replacing existing material", async () => {
    read.mockResolvedValue({ title: "Dokumen", text: "Isi dari dokumen" });
    const submit = vi.fn();
    renderWithProviders(<BankMaterialForm folders={folders} folderId={2} pending={false} onSubmit={submit} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: "Judul materi" }), { target: { value: "Judul guru" } });
    fireEvent.change(screen.getByRole("textbox", { name: /^Materi$/ }), { target: { value: "Isi lama" } });
    fireEvent.change(screen.getByLabelText("Pilih dokumen"), { target: { files: [new File(["test"], "materi.docx")] } });
    const preview = await screen.findByRole("textbox", { name: "Hasil pembacaan dokumen" });
    expect(screen.getByRole("textbox", { name: /^Materi$/ })).toHaveValue("Isi lama");
    fireEvent.change(preview, { target: { value: "Hasil diperbaiki" } });
    fireEvent.click(screen.getByRole("button", { name: "Tambahkan teks ke materi" }));
    expect(screen.getByRole("textbox", { name: "Judul materi" })).toHaveValue("Judul guru");
    expect(screen.getByRole("textbox", { name: /^Materi$/ })).toHaveValue("Isi lama\n\nHasil diperbaiki");
    expect(submit).not.toHaveBeenCalled();
    fireEvent.submit(screen.getByRole("button", { name: "Simpan materi" }).closest("form")!);
    await waitFor(() => expect(submit).toHaveBeenCalledWith(expect.objectContaining({ title: "Judul guru", explanation: "Isi lama\n\nHasil diperbaiki", questions: [] })));
  });
  it("retains the preview when combined content exceeds the material limit", async () => {
    read.mockResolvedValue({ title: "Dokumen", text: "baru" });
    renderWithProviders(<BankMaterialForm folders={folders} folderId={2} pending={false} onSubmit={vi.fn()} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByRole("textbox", { name: /^Materi$/ }), { target: { value: "x".repeat(19999) } });
    fireEvent.change(screen.getByLabelText("Pilih dokumen"), { target: { files: [new File(["test"], "materi.docx")] } });
    await screen.findByRole("textbox", { name: "Hasil pembacaan dokumen" });
    fireEvent.click(screen.getByRole("button", { name: "Tambahkan teks ke materi" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Gabungan teks");
    expect(screen.getByRole("textbox", { name: "Hasil pembacaan dokumen" })).toHaveValue("baru");
  });
});
