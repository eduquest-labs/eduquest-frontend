"use client";
import { useState } from "react";
import { isAxiosError } from "axios";
import { AlertDialog, Button, Input, Label, Modal, Skeleton, TextField, toast } from "@heroui/react";
import { BookOpen, ChevronRight, Folder, FolderPlus, Plus, Search } from "lucide-react";
import { useBankFolders, useBankMaterial, useBankMaterials } from "@/hooks/queries";
import { useBankMutation } from "@/hooks/mutations";
import { bankFolderSchema } from "@/lib/activity-bank-validations";
import type { BankCollection, BankCommand } from "@/types";
import { BankMaterialDetail } from "./BankMaterialDetail";
import { BankMaterialForm } from "./BankMaterialForm";
import styles from "./BankActivity.module.css";

interface BankActivityPageClientProps { admin?: boolean; importTarget?: { challengeId: number; classId: number; topicId: number }; }
export function BankActivityPageClient({ admin = false, importTarget }: BankActivityPageClientProps) {
  const [collection, setCollection] = useState<BankCollection>("shared");
  const [folderId, setFolderId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [folderForm, setFolderForm] = useState<{ id?: number; name: string; parentId: number | null } | null>(null);
  const [confirm, setConfirm] = useState<BankCommand | null>(null);
  const foldersQuery = useBankFolders();
  const materialsQuery = useBankMaterials({ collection, folderId: folderId ?? undefined, search, page });
  const detailQuery = useBankMaterial(materialId);
  const mutation = useBankMutation();
  const folders = foldersQuery.data ?? [];
  const visibleFolders = folders.filter((f) => f.collection === collection);
  const managedFolders = folders.filter((f) => admin ? f.collection === "shared" : f.collection === "private");
  const canManage = admin || collection === "private";
  const selectedFolder = folders.find((f) => f.id === folderId);
  const breadcrumb = [];
  const visited = new Set<number>();
  let cursor = selectedFolder;
  while (cursor && !visited.has(cursor.id)) { breadcrumb.unshift(cursor); visited.add(cursor.id); cursor = folders.find((f) => f.id === cursor!.parentId); }
  function selectFolder(id: number | null) { setFolderId(id); setPage(1); setMaterialId(null); setEditing(false); setError(""); }
  async function execute(command: BankCommand) {
    setError("");
    try {
      const result = await mutation.mutateAsync(command);
      if (command.action === "deleteMaterial" || command.action === "saveMaterial" || command.action === "copy") setPage(1);
      toast.success(command.action === "importQuestions" ? "Soal ditambahkan ke draft kuis." : "Perubahan berhasil disimpan.");
      return result;
    } catch (caught) {
      const message = isAxiosError(caught) ? (Object.values(caught.response?.data?.errors ?? {}).flat().join(" ") || caught.response?.data?.message) : null;
      setError(message || "Perubahan gagal disimpan. Silakan coba lagi.");
      throw caught;
    }
  }
  return <div className={styles.page}>
    <header className={styles.header}>
      <div><span className={styles.eyebrow}>PUSTAKA PEMBELAJARAN</span><h1>Bank Aktivitas Gerak</h1><p className={styles.muted}>Temukan panduan gerak, susun materi, dan gunakan kembali contoh tugas serta soal.</p></div>
      {canManage && !editing && !materialId ? <div className={styles.actions}>
        <Button variant="secondary" onPress={() => setFolderForm({ name: "", parentId: folderId })}><FolderPlus size={16} /> Folder baru</Button>
        <Button isDisabled={!managedFolders.length || foldersQuery.isError} onPress={() => { setEditing(true); setMaterialId(null); }}><Plus size={16} /> Tambah materi</Button>
      </div> : null}
    </header>
    {error ? <p role="alert" className={styles.error}>{error}</p> : null}
    {importTarget ? <p className={styles.muted}>Pilih materi dan soal untuk ditambahkan ke kuis yang sedang diedit.</p> : null}
    {foldersQuery.isError ? <div role="alert" className={styles.error}>Folder gagal dimuat. <Button variant="tertiary" onPress={() => { void foldersQuery.refetch(); }}>Coba lagi</Button></div> : null}
    {editing ? (materialId && !detailQuery.data ? <p className={styles.muted}>Memuat materi…</p> : <BankMaterialForm key={materialId ?? "new"} folders={managedFolders} folderId={folderId ?? managedFolders[0]?.id ?? 0} material={materialId ? detailQuery.data : undefined} pending={mutation.isPending} onCancel={() => setEditing(false)} onSubmit={async (input) => { const result = await execute({ action: "saveMaterial", id: materialId ?? undefined, input }); setEditing(false); if (result.material) setMaterialId(result.material.id); }} />)
      : materialId ? <>{detailQuery.isLoading ? <Skeleton className="h-60 w-full rounded-xl" /> : detailQuery.isError ? <div role="alert" className={styles.error}>Materi gagal dimuat. <Button variant="tertiary" onPress={() => { void detailQuery.refetch(); }}>Coba lagi</Button><Button variant="tertiary" onPress={() => setMaterialId(null)}>Kembali</Button></div> : detailQuery.data ? <BankMaterialDetail key={detailQuery.data.version} material={detailQuery.data} folders={folders} admin={admin} pending={mutation.isPending} importTarget={importTarget} execute={execute} onBack={() => setMaterialId(null)} onEdit={() => setEditing(true)} onDelete={() => setConfirm({ action: "deleteMaterial", id: materialId })} /> : null}</>
      : <>
        {!admin ? <div className={styles.tabs} role="group" aria-label="Koleksi materi">{(["shared", "private"] as const).map((value) => <Button key={value} variant={collection === value ? "primary" : "secondary"} aria-pressed={collection === value} onPress={() => { setCollection(value); selectFolder(null); }}>{value === "shared" ? "Koleksi Bersama" : "Materi Saya"}</Button>)}</div> : null}
        <div className={styles.search}><TextField className="w-full" value={search} onChange={(value) => { setSearch(value); setPage(1); }}><Label>Cari materi</Label><div className="relative w-full"><Input className="w-full pr-10" placeholder="Cari judul atau ringkasan aktivitas…" /><Search size={16} className="pointer-events-none absolute right-3 top-3 text-muted" /></div></TextField></div>
        <div className={styles.layout}>
          <aside className={styles.folders}><div className={styles.toolbar}><h3 className="font-semibold">Folder materi</h3><span className={styles.muted}>{visibleFolders.length}</span></div>
            {foldersQuery.isLoading ? <Skeleton className="mt-4 h-40 rounded-lg" /> : <div className={styles.folderList}>
              <button className={styles.folder + (!folderId ? " " + styles.activeFolder : "")} onClick={() => selectFolder(null)}><BookOpen size={16} /><span>Semua materi</span></button>
              {visibleFolders.filter((f) => f.parentId === folderId).map((folder) => <button key={folder.id} className={styles.folder} onClick={() => selectFolder(folder.id)}><Folder size={16} /><span>{folder.name}</span><small>{folder.materialCount}</small><ChevronRight size={14} /></button>)}
              {!visibleFolders.length ? <p className={styles.muted}>{canManage ? "Buat folder pertama untuk mengelompokkan materi." : "Koleksi bersama belum memiliki folder."}</p> : null}
              {folderId ? <Button variant="tertiary" onPress={() => selectFolder(selectedFolder?.parentId ?? null)}>Kembali ke folder induk</Button> : null}
            </div>}
          </aside>
          <section className="min-w-0">
            <nav aria-label="Lokasi folder" className={styles.breadcrumb}><button onClick={() => selectFolder(null)}>Bank aktivitas</button>{breadcrumb.map((f) => <span key={f.id}><ChevronRight size={12} className="inline" /><button onClick={() => selectFolder(f.id)}>{f.name}</button></span>)}</nav>
            <div className={styles.toolbar}><div><h2>{selectedFolder?.name ?? "Semua materi"}</h2><p className={styles.muted}>{materialsQuery.data?.total ?? 0} materi{materialsQuery.isFetching ? " · Memuat…" : ""}</p></div>{selectedFolder && canManage ? <div className={styles.actions}><Button size="sm" variant="tertiary" onPress={() => setFolderForm({ id: selectedFolder.id, name: selectedFolder.name, parentId: selectedFolder.parentId })}>Edit folder</Button><Button size="sm" variant="tertiary" onPress={() => setConfirm({ action: "deleteFolder", id: selectedFolder.id })}>Hapus folder</Button></div> : null}</div>
            {materialsQuery.isError ? <div role="alert" className={styles.error}>Daftar materi gagal dimuat. <Button variant="tertiary" onPress={() => { void materialsQuery.refetch(); }}>Coba lagi</Button></div> : materialsQuery.isLoading ? <div className={styles.grid}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-52 rounded-xl" />)}</div> : !materialsQuery.data?.data.length ? <div className={styles.empty}><BookOpen size={28} /><h3>{search ? "Materi tidak ditemukan" : "Belum ada materi"}</h3><p className={styles.muted}>{search ? "Coba kata kunci lain atau buka folder berbeda." : canManage ? "Tambahkan panduan aktivitas dan contoh soal ke folder ini." : "Materi bersama tampil setelah pengelola mempublikasikannya."}</p></div> : <div className={styles.grid}>{materialsQuery.data.data.map((material) => <button key={material.id} className={styles.card} onClick={() => { setMaterialId(material.id); setError(""); }}><div className={styles.meta}><span>{material.folder.name}</span><span>{material.folder.collection === "private" ? "Pribadi" : material.status === "draft" ? "Draft" : "Tersedia"}</span></div><h3>{material.title}</h3><p>{material.summary || "Buka untuk membaca panduan aktivitas."}</p><div className={styles.tags}>{material.tags.slice(0, 3).map((tag, i) => <span className={styles.tag} key={i}>{tag}</span>)}<span className={styles.tag}>{material.questions.length} soal</span></div></button>)}</div>}
            {materialsQuery.data && materialsQuery.data.lastPage > 1 ? <div className={styles.pagination}><Button variant="secondary" isDisabled={page <= 1} onPress={() => setPage(page - 1)}>Sebelumnya</Button><span>{page} / {materialsQuery.data.lastPage}</span><Button variant="secondary" isDisabled={page >= materialsQuery.data.lastPage} onPress={() => setPage(page + 1)}>Berikutnya</Button></div> : null}
          </section>
        </div>
      </>}
    <Modal.Backdrop isOpen={folderForm !== null} onOpenChange={(open) => { if (!open) setFolderForm(null); }}><Modal.Container><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>{folderForm?.id ? "Edit folder" : "Folder baru"}</Modal.Heading></Modal.Header><Modal.Body>{folderForm ? <form className={styles.formFields} onSubmit={async (e) => {
      e.preventDefault();
      const parsed = bankFolderSchema.safeParse(folderForm);
      if (!parsed.success) { setError(parsed.error.issues[0].message); return; }
      try { await execute(folderForm.id ? { action: "updateFolder", id: folderForm.id, ...parsed.data } : { action: "createFolder", collection, ...parsed.data }); setFolderForm(null); } catch { /* Preserve dialog for correction. */ }
    }}><TextField value={folderForm.name} onChange={(name) => setFolderForm({ ...folderForm, name })}><Label>Nama folder</Label><Input /></TextField><label className={styles.field}>Folder induk<select value={folderForm.parentId ?? 0} onChange={(e) => setFolderForm({ ...folderForm, parentId: Number(e.target.value) || null })}><option value={0}>Folder utama</option>{managedFolders.filter((f) => f.id !== folderForm.id).map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}</select></label>{error ? <p role="alert" className={styles.error}>{error}</p> : null}<Button type="submit" isPending={mutation.isPending} isDisabled={mutation.isPending}>Simpan folder</Button></form> : null}</Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>
    <AlertDialog.Backdrop isOpen={confirm !== null} onOpenChange={(open) => { if (!open) setConfirm(null); }}><AlertDialog.Container><AlertDialog.Dialog><AlertDialog.Header><AlertDialog.Icon status="danger" /><AlertDialog.Heading>Hapus {confirm?.action === "deleteFolder" ? "folder" : "materi"}?</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p>Salinan yang sudah digunakan pada challenge tetap tersimpan. Folder hanya dapat dihapus setelah isinya dipindahkan atau dihapus.</p>{error ? <p role="alert" className={styles.error}>{error}</p> : null}</AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Batal</Button><Button variant="danger" isPending={mutation.isPending} isDisabled={mutation.isPending} onPress={() => { if (!confirm) return; void execute(confirm).then(() => { if (confirm.action === "deleteFolder") selectFolder(null); else setMaterialId(null); setConfirm(null); }).catch(() => {}); }}>Hapus</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
  </div>;
}
