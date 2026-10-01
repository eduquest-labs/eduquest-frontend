export interface BankDocumentText { title: string; text: string; }
export const MAX_DOCUMENT_TEXT = 20000;

/** Reads locally; neither the source file nor its text is sent to an external service. */
export async function extractBankDocument(file: File): Promise<BankDocumentText> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension !== "pdf" && extension !== "docx") throw new Error("Pilih berkas PDF atau DOCX. Untuk .doc, simpan ulang sebagai .docx terlebih dahulu.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran berkas maksimal 10 MB.");
  const data = new Uint8Array(await file.arrayBuffer());
  const header = new TextDecoder().decode(data.slice(0, 5));
  if (extension === "pdf" ? header !== "%PDF-" : data[0] !== 0x50 || data[1] !== 0x4b) throw new Error("Isi berkas tidak sesuai dengan format PDF/DOCX.");
  let text: string;
  if (extension === "docx") {
    const mammoth = await import("mammoth");
    text = (await mammoth.extractRawText({ arrayBuffer: data.buffer })).value;
  } else {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `/document-import/pdf.worker-${pdfjs.version}.min.mjs`;
    const task = pdfjs.getDocument({ data, cMapUrl: `/document-import/${pdfjs.version}/cmaps/`, cMapPacked: true, standardFontDataUrl: `/document-import/${pdfjs.version}/standard_fonts/` });
    try {
      const document = await task.promise;
      if (document.numPages > 100) throw new Error("PDF maksimal 100 halaman. Pisahkan dokumen menjadi bagian yang lebih kecil.");
      const pages: string[] = [];
      for (let number = 1; number <= document.numPages; number++) {
        const page = await document.getPage(number);
        try {
          const content = await page.getTextContent();
          pages.push(content.items.map((item) => "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "").join("").trim());
        } finally { page.cleanup(); }
      }
      text = pages.join("\n\n");
    } finally { await task.destroy(); }
  }
  text = text.replace(/\r\n?/g, "\n").replace(/\u0000/g, "").trim();
  if (!text) throw new Error("Tidak ada teks yang dapat dibaca. PDF hasil scan/gambar belum didukung; gunakan PDF berisi teks atau DOCX.");
  return { title: file.name.replace(/\.(pdf|docx)$/i, "").slice(0, 200), text };
}
