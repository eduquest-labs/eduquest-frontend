"use client";
import { useEffect, useRef, useState } from "react";
import { Button, Label, TextArea, TextField } from "@heroui/react";
import { FileUp } from "lucide-react";
import { extractBankDocument, MAX_DOCUMENT_TEXT, type BankDocumentText } from "@/services/modules/bank-document-import.service";
import styles from "./BankActivity.module.css";

interface Props { disabled: boolean; onApply: (document: BankDocumentText) => boolean; }
export function BankDocumentImport({ disabled, onApply }: Props) {
  const [document, setDocument] = useState<BankDocumentText | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  useEffect(() => () => { request.current++; }, []);

  async function read(file: File) {
    const current = ++request.current;
    setBusy(true); setError(""); setDocument(null);
    try {
      const result = await extractBankDocument(file);
      if (current === request.current) setDocument(result);
    } catch (caught) {
      if (current === request.current) setError(caught instanceof Error && /Pilih berkas|maksimal|Isi berkas|Tidak ada teks/.test(caught.message) ? caught.message : "Dokumen gagal dibaca. Pastikan berkas tidak rusak atau dilindungi kata sandi.");
    } finally { if (current === request.current) setBusy(false); }
  }

  return <section className={styles.importer} aria-label="Impor dokumen">
    <h3 className="font-semibold flex items-center gap-2"><FileUp size={18} /> Impor PDF / Word</h3>
    <p className={styles.muted}>Ambil teks dari PDF atau DOCX, periksa hasilnya, lalu tambahkan ke materi. Maksimal 10 MB; PDF maksimal 100 halaman. PDF hasil scan belum didukung.</p>
    <label className={styles.field}>Pilih dokumen<input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" disabled={disabled || busy} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (file) void read(file); }} /></label>
    {busy ? <p role="status">Membaca dokumen…</p> : null}
    {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    {document ? <div className={styles.formFields}>
      <TextField value={document.text} onChange={(text) => setDocument({ ...document, text })} isDisabled={disabled}><Label>Hasil pembacaan dokumen</Label><TextArea className="w-full" rows={8} /></TextField>
      <p className={styles.muted}>{document.text.length.toLocaleString("id-ID")} / {MAX_DOCUMENT_TEXT.toLocaleString("id-ID")} karakter. Rapikan atau pilih bagian yang diperlukan. Soal dan gambar tidak diimpor otomatis.</p>
      {document.text.length > MAX_DOCUMENT_TEXT ? <p role="alert" className={styles.error}>Teks melebihi batas materi. Kurangi hingga 20.000 karakter sebelum menambahkan.</p> : null}
      <div className={styles.actions}><Button type="button" variant="secondary" isDisabled={disabled || !document.text.trim() || document.text.trim().length > MAX_DOCUMENT_TEXT} onPress={() => { if (onApply({ ...document, text: document.text.trim() })) setDocument(null); }}>Tambahkan teks ke materi</Button><Button type="button" variant="tertiary" isDisabled={disabled} onPress={() => setDocument(null)}>Batal impor</Button></div>
      <p className={styles.muted}>Teks ditambahkan setelah isi materi yang sudah ada. Simpan materi untuk menyimpan perubahan; berkas asli tidak disimpan.</p>
    </div> : null}
  </section>;
}
