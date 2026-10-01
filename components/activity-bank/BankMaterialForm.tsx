"use client";
import { useState } from "react";
import { Button, Input, Label, TextArea, TextField } from "@heroui/react";
import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { QuestionForm } from "@/components/base/shared/QuestionForm";
import { bankMaterialSchema } from "@/lib/activity-bank-validations";
import type { BankFolder, BankMaterial, BankMaterialInput, Question } from "@/types";
import styles from "./BankActivity.module.css";
import { BankDocumentImport } from "./BankDocumentImport";

interface BankMaterialFormProps { folders: BankFolder[]; folderId: number; material?: BankMaterial; pending: boolean; onSubmit: (input: BankMaterialInput) => Promise<void>; onCancel: () => void; }
const fields = [["summary", "Ringkasan"], ["objectives", "Tujuan pembelajaran"], ["explanation", "Materi"], ["equipmentAndPlace", "Alat dan tempat"], ["steps", "Langkah kegiatan"], ["taskInstruction", "Contoh instruksi tugas"]] as const;
export function BankMaterialForm({ folders, folderId, material, pending, onSubmit, onCancel }: BankMaterialFormProps) {
  const [values, setValues] = useState<BankMaterialInput>(material ?? { folderId, title: "", summary: "", objectives: "", explanation: "", equipmentAndPlace: "", steps: "", taskInstruction: "", targetLevel: "", tags: [], mediaLinks: [], references: [], questions: [] });
  const [error, setError] = useState("");
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const current = editingQuestion !== null ? values.questions[editingQuestion] : undefined;
  const preview: Question | undefined = current ? { ...current, id: editingQuestion!, challengeId: 0, points: current.points ?? 10, sortOrder: current.sortOrder ?? 0, timeLimitSeconds: current.timeLimitSeconds ?? null, correctAnswerText: current.correctAnswerText ?? null, options: (current.options ?? []).map((o, i) => ({ ...o, id: i, questionId: 0, sortOrder: o.sortOrder ?? i })), createdAt: "", updatedAt: "" } : undefined;
  if (editingQuestion !== null) return <section className={styles.editor}>
    <div className={styles.toolbar}><h2>{current ? "Edit contoh soal" : "Tambah contoh soal"}</h2><Button variant="tertiary" onPress={() => setEditingQuestion(null)}>Kembali ke materi</Button></div>
    <p className={styles.muted}>Soal disimpan bersama materi setelah kamu menekan Simpan materi.</p>
    <QuestionForm question={preview} isPending={false} isPublished={false} onSubmit={async (input) => {
      setValues((old) => ({ ...old, questions: current ? old.questions.map((q, i) => i === editingQuestion ? input : q) : [...old.questions, input] }));
      setEditingQuestion(null);
    }} />
  </section>;
  return <form className={styles.editor} onSubmit={async (event) => {
    event.preventDefault();
    const parsed = bankMaterialSchema.safeParse(values);
    if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
    setError("");
    try { await onSubmit({ ...parsed.data, tags: parsed.data.tags.filter(Boolean), questions: values.questions }); } catch { /* API error is displayed by the parent. */ }
  }}>
    <div className={styles.toolbar}><h2>{material ? "Edit materi" : "Susun panduan aktivitas"}</h2><Button type="button" variant="tertiary" onPress={onCancel}>Batal</Button></div>
    {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    <BankDocumentImport disabled={pending} onApply={(document) => {
      const explanation = [values.explanation.trim(), document.text].filter(Boolean).join("\n\n");
      if (explanation.length > 20000) { setError("Gabungan teks dan materi melebihi 20.000 karakter. Kurangi teks atau isi materi terlebih dahulu."); return false; }
      setError("");
      setValues({ ...values, title: values.title.trim() ? values.title : document.title, explanation });
      return true;
    }} />
    <fieldset disabled={pending} className={styles.formFields}>
      <label className={styles.field}>Folder<select value={values.folderId} onChange={(e) => setValues({ ...values, folderId: Number(e.target.value) })}><option value={0}>Pilih folder</option>{folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>
      <TextField value={values.title} onChange={(title) => setValues({ ...values, title })}><Label>Judul materi</Label><Input /></TextField>
      <div className={styles.twoColumns}>
        <TextField value={values.targetLevel} onChange={(targetLevel) => setValues({ ...values, targetLevel })}><Label>Jenjang / sasaran (opsional)</Label><Input /></TextField>
        <TextField value={values.tags.join(", ")} onChange={(tags) => setValues({ ...values, tags: tags.split(",") })}><Label>Tag, pisahkan dengan koma</Label><Input /></TextField>
      </div>
      {fields.map(([key, label]) => <TextField key={key} value={values[key]} onChange={(value) => setValues({ ...values, [key]: value })}><Label>{label}</Label><TextArea rows={key === "explanation" || key === "steps" ? 5 : 3} /></TextField>)}
      {(["mediaLinks", "references"] as const).map((key) => <section key={key} className={styles.formFields}>
        <div className={styles.toolbar}><h3>{key === "mediaLinks" ? "Media pendukung" : "Sumber referensi"}</h3><Button type="button" size="sm" variant="secondary" onPress={() => setValues({ ...values, [key]: [...values[key], { label: "", url: "" }] })}><Plus size={14} /> Tambah tautan</Button></div>
        <p className={styles.muted}>{key === "mediaLinks" ? "Tautkan PDF, gambar, atau video yang boleh digunakan." : "Catat sumber dan asal materi."}</p>
        {values[key].map((link, index) => <div className={styles.linkRow} key={index}>
          <Input aria-label={"Label " + key + " " + (index + 1)} placeholder="Nama sumber / media" value={link.label} onChange={(e) => setValues({ ...values, [key]: values[key].map((item, i) => i === index ? { ...item, label: e.target.value } : item) })} />
          <Input aria-label={"URL " + key + " " + (index + 1)} placeholder="https://" value={link.url} onChange={(e) => setValues({ ...values, [key]: values[key].map((item, i) => i === index ? { ...item, url: e.target.value } : item) })} />
          <Button type="button" variant="tertiary" aria-label="Hapus tautan" onPress={() => setValues({ ...values, [key]: values[key].filter((_, i) => i !== index) })}><Trash2 size={16} /></Button>
        </div>)}
      </section>)}
      <section className={styles.formFields}>
        <div className={styles.toolbar}><h3>Contoh soal · {values.questions.length}</h3><Button type="button" variant="secondary" onPress={() => setEditingQuestion(values.questions.length)}><Plus size={15} /> Tambah soal</Button></div>
        {!values.questions.length ? <p className={styles.muted}>Opsional. Tambahkan soal yang bisa digunakan ulang pada kuis.</p> : null}
        {values.questions.map((q, index) => <div className={styles.questionRow} key={index}><div><span className={styles.muted}>{index + 1} · {q.points ?? 10} poin</span><p>{q.questionText}</p></div><div className={styles.actions}>
          <Button type="button" variant="tertiary" aria-label={"Edit soal " + (index + 1)} onPress={() => setEditingQuestion(index)}><Pencil size={15} /></Button>
          <Button type="button" variant="tertiary" aria-label={"Duplikat soal " + (index + 1)} onPress={() => setValues({ ...values, questions: [...values.questions, structuredClone(q)] })}><Copy size={15} /></Button>
          <Button type="button" variant="tertiary" aria-label={"Hapus soal " + (index + 1)} onPress={() => setValues({ ...values, questions: values.questions.filter((_, i) => i !== index) })}><Trash2 size={15} /></Button>
        </div></div>)}
      </section>
    </fieldset>
    <div className={styles.actions}><Button type="submit" isPending={pending} isDisabled={pending || !folders.length}>Simpan materi</Button><span className={styles.muted}>Materi baru disimpan sebagai draft.</span></div>
  </form>;
}
