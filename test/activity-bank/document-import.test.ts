import { describe, expect, it, vi } from "vitest";
import { extractBankDocument } from "@/services/modules/bank-document-import.service";

const pdf = vi.hoisted(() => ({ destroy: vi.fn(), getPage: vi.fn(), numPages: 2 }));
vi.mock("pdfjs-dist", () => ({ version: "test", GlobalWorkerOptions: {}, getDocument: () => ({ promise: Promise.resolve(pdf), destroy: pdf.destroy }) }));
vi.mock("mammoth", () => ({ extractRawText: vi.fn(async () => ({ value: "Tujuan\n\nMemahami gerak.\n", messages: [] })) }));
const file = (name: string, header: string) => ({ name, size: header.length, arrayBuffer: async () => new TextEncoder().encode(header).buffer }) as File;

describe("document import without AI", () => {
  it("reads PDF pages in order with line and page breaks and frees the worker", async () => {
    pdf.getPage.mockImplementation(async (page: number) => ({ getTextContent: async () => ({ items: [{ str: page === 1 ? "Panduan jogging" : "Langkah kegiatan", hasEOL: true }, { str: "Isi halaman", hasEOL: true }] }), cleanup: vi.fn() }));
    const result = await extractBankDocument(file("Panduan.pdf", "%PDF-1.7"));
    expect(result.title).toBe("Panduan");
    expect(result.text).toBe("Panduan jogging\nIsi halaman\n\nLangkah kegiatan\nIsi halaman");
    expect(pdf.destroy).toHaveBeenCalled();
  });
  it("extracts DOCX as plain text rather than rendering document HTML", async () => {
    expect(await extractBankDocument(file("Materi.docx", "PK\u0003\u0004"))).toEqual({ title: "Materi", text: "Tujuan\n\nMemahami gerak." });
  });
  it("rejects legacy Word, excessive size, mismatched content and empty scanned PDFs", async () => {
    await expect(extractBankDocument(file("lama.doc", "abc"))).rejects.toThrow("PDF atau DOCX");
    await expect(extractBankDocument({ ...file("besar.pdf", "%PDF-"), size: 11 * 1024 * 1024 } as File)).rejects.toThrow("10 MB");
    await expect(extractBankDocument(file("palsu.pdf", "bukan pdf"))).rejects.toThrow("Isi berkas");
    pdf.getPage.mockResolvedValue({ getTextContent: async () => ({ items: [] }), cleanup: vi.fn() });
    await expect(extractBankDocument(file("scan.pdf", "%PDF-1.7"))).rejects.toThrow("scan");
  });
});
