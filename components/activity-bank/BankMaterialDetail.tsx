"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, TextField } from "@heroui/react";
import { ArrowLeft, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useClasses, useTopics } from "@/hooks/queries";
import type { BankActionResult, BankCommand, BankFolder, BankMaterial } from "@/types";
import styles from "./BankActivity.module.css";

interface BankMaterialDetailProps {
  material: BankMaterial; folders: BankFolder[]; admin: boolean; pending: boolean;
  importTarget?: { challengeId: number; classId: number; topicId: number };
  execute: (command: BankCommand) => Promise<BankActionResult>;
  onBack: () => void; onEdit: () => void; onDelete: () => void;
}
const sections = [["objectives", "Tujuan pembelajaran"], ["explanation", "Materi"], ["equipmentAndPlace", "Alat dan tempat"], ["steps", "Langkah kegiatan"], ["taskInstruction", "Contoh instruksi tugas"]] as const;
export function BankMaterialDetail({ material, folders, admin, pending, importTarget, execute, onBack, onEdit, onDelete }: BankMaterialDetailProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);
  const [classId, setClassId] = useState(0);
  const [topicId, setTopicId] = useState(0);
  const [type, setType] = useState<"kuis" | "aktivitas_fisik">("aktivitas_fisik");
  const [title, setTitle] = useState(material.title);
  const [copyFolderId, setCopyFolderId] = useState(0);
  const classes = useClasses(!admin && !importTarget);
  const topics = useTopics(classId, !admin && !importTarget && classId > 0);
  const canEdit = admin || material.folder.collection === "private";
  const personalFolders = folders.filter((f) => f.collection === "private");
  async function handleUseMaterial() {
    try {
      const result = await execute(importTarget
        ? { action: "importQuestions", id: material.id, challengeId: importTarget.challengeId, questionIndices: selected, version: material.version }
        : { action: "createChallenge", id: material.id, topicId, title, type, questionIndices: type === "kuis" ? selected : [], version: material.version });
      const target = result.challenge ?? (importTarget ? { id: importTarget.challengeId, classId: importTarget.classId, topicId: importTarget.topicId } : undefined);
      if (target) router.push("/guru/authoring/classes/" + target.classId + "/topics/" + target.topicId + "/challenges/" + target.id);
    } catch { /* Parent displays API feedback. */ }
  }
  return <article className={styles.detail}>
    <Button variant="tertiary" onPress={onBack}><ArrowLeft size={16} /> Kembali ke bank</Button>
    <header className={styles.detailHeader}>
      <div className={styles.meta}><span>{material.folder.name}</span><span>{material.folder.collection === "shared" ? (material.status === "published" ? "Tersedia" : "Draft bersama") : "Materi pribadi"}</span></div>
      <h2>{material.title}</h2><p className={styles.muted}>{material.summary}</p>
      <div className={styles.tags}>{material.tags.map((tag, i) => <span key={i} className={styles.tag}>{tag}</span>)}{material.targetLevel ? <span className={styles.tag}>{material.targetLevel}</span> : null}</div>
      {canEdit ? <div className={styles.actions}>
        <Button variant="secondary" onPress={onEdit}><Pencil size={15} /> Edit materi</Button>
        {admin ? <Button variant="secondary" isDisabled={pending} onPress={() => { void execute({ action: material.status === "draft" ? "publish" : "unpublish", id: material.id }).catch(() => {}); }}>{material.status === "draft" ? "Publikasikan" : "Kembalikan ke draft"}</Button> : null}
        <Button variant="tertiary" onPress={onDelete}><Trash2 size={15} /> Hapus</Button>
      </div> : null}
    </header>
    {sections.map(([key, label]) => material[key] ? <section className={styles.section} key={key}><h3>{label}</h3><p>{material[key]}</p></section> : null)}
    {(["mediaLinks", "references"] as const).map((key) => material[key].length ? <section className={styles.section} key={key}><h3>{key === "mediaLinks" ? "Media pendukung" : "Sumber referensi"}</h3>{material[key].map((link, i) => <a key={i} href={link.url} target="_blank" rel="noopener noreferrer">{link.label} <ExternalLink size={13} className="inline" /></a>)}</section> : null)}
    <section className={styles.section}>
      <div className={styles.toolbar}><h3>Contoh soal · {material.questions.length}</h3>{!admin && material.questions.length ? <Button variant="tertiary" onPress={() => setSelected(selected.length === material.questions.length ? [] : material.questions.map((_, i) => i))}>{selected.length === material.questions.length ? "Batalkan pilihan" : "Pilih semua"}</Button> : null}</div>
      {!material.questions.length ? <p className={styles.muted}>Materi ini belum memiliki contoh soal.</p> : null}
      {material.questions.map((q, index) => <div className={styles.selection} key={index}>
        <div className="min-w-0 flex-1">
          <label className={styles.selectionLabel}>
            {!admin ? <input type="checkbox" aria-label={"Pilih soal " + (index + 1)} checked={selected.includes(index)} onChange={() => setSelected((old) => old.includes(index) ? old.filter((i) => i !== index) : [...old, index])} /> : null}
            <span><span className={styles.muted}>{index + 1} · {q.points ?? 10} poin</span><p>{q.questionText}</p></span>
          </label>
          {q.questionType === "pilihan_ganda" ? <ul>{q.options?.map((o, i) => <li key={i} className={o.isCorrect ? styles.correct : ""}>{o.optionText}{o.isCorrect ? " — jawaban benar" : ""}</li>)}</ul> : q.correctAnswerText ? <p className={styles.correct}>Jawaban: {q.correctAnswerText}</p> : <p className={styles.muted}>Esai dinilai manual oleh guru.</p>}
        </div>
      </div>)}
    </section>
    {!admin ? <section className={styles.usePanel}>
      <h3 className="font-semibold">{importTarget ? "Tambahkan ke kuis yang sedang diedit" : "Gunakan materi di kelas"}</h3>
      {importTarget ? <p className={styles.muted}>{selected.length} soal dipilih. Soal akan disalin ke draft kuis.</p> : <>
        <TextField value={title} onChange={setTitle}><Label>Judul challenge</Label><Input /></TextField>
        {classes.isError || topics.isError ? <p role="alert" className={styles.error}>Pilihan kelas atau topic gagal dimuat. <button type="button" onClick={() => { void classes.refetch(); void topics.refetch(); }}>Coba lagi</button></p> : null}
        <div className={styles.twoColumns}>
          <label className={styles.field}>Kelas<select disabled={classes.isLoading} value={classId} onChange={(e) => { setClassId(Number(e.target.value)); setTopicId(0); }}><option value={0}>{classes.isLoading ? "Memuat kelas…" : "Pilih kelas"}</option>{classes.data?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
          <label className={styles.field}>Topic<select value={topicId} disabled={!classId || topics.isLoading} onChange={(e) => setTopicId(Number(e.target.value))}><option value={0}>Pilih topic</option>{topics.data?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        </div>
        <label className={styles.field}>Jenis challenge<select value={type} onChange={(e) => setType(e.target.value as typeof type)}><option value="aktivitas_fisik">Aktivitas fisik</option><option value="kuis">Kuis</option></select></label>
        <p className={styles.muted}>{type === "kuis" ? selected.length + " soal akan disalin." : "Contoh instruksi disalin ke challenge aktivitas fisik."} Jadwal dan poin dapat disesuaikan di editor.</p>
        <p className={styles.muted}>Pratinjau instruksi: {material.taskInstruction || material.summary || "Tanpa instruksi"}</p>
      </>}
      <Button isPending={pending} isDisabled={pending || (importTarget ? selected.length === 0 : !topicId || !title.trim())} onPress={() => { void handleUseMaterial(); }}>{importTarget ? "Tambahkan soal terpilih" : "Buat draft challenge"}</Button>
    </section> : null}
    {!admin && material.folder.collection === "shared" ? <section className={styles.usePanel}><h3 className="font-semibold">Salin ke Materi Saya</h3><p className={styles.muted}>Sesuaikan isi tanpa mengubah koleksi bersama.</p><label className={styles.field}>Folder pribadi<select value={copyFolderId} onChange={(e) => setCopyFolderId(Number(e.target.value))}><option value={0}>Pilih folder pribadi</option>{personalFolders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>{!personalFolders.length ? <p className={styles.muted}>Buat folder pada tab Materi Saya terlebih dahulu.</p> : null}<Button variant="secondary" isDisabled={!copyFolderId || pending} onPress={() => { void execute({ action: "copy", id: material.id, folderId: copyFolderId }).catch(() => {}); }}><Copy size={15} /> Salin materi</Button></section> : null}
  </article>;
}
