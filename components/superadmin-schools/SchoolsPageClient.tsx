"use client";

import { ResearchSelect } from "@/components/superadmin-shared/ResearchSelect";
import { useState } from "react";
import { Plus } from "lucide-react";

import { AlertDialog, Alert, Button, Modal, Skeleton, toast } from "@heroui/react";

import { useDeleteSchool } from "@/hooks/mutations";
import { useSuperadminSchools } from "@/hooks/queries";
import { CreateSchoolForm } from "@/components/superadmin-schools/CreateSchoolForm";
import { EditSchoolForm } from "@/components/superadmin-schools/EditSchoolForm";
import { SchoolsTable } from "@/components/superadmin-schools/SchoolsTable";
import type { SchoolWithStats } from "@/types";
import { ResearchEmpty, ResearchHeader, ResearchMetric, ResearchMetrics, ResearchPage, ResearchPanel, ResearchSearch, researchStyles as styles } from "@/components/superadmin-shared/ResearchUI";

export function SchoolsPageClient() {
  const { data, isLoading, isError, refetch } = useSuperadminSchools();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolWithStats | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolWithStats | null>(null);
  const deleteSchool = useDeleteSchool();
  const [search, setSearch] = useState("");
  const [coverage, setCoverage] = useState("all");
  const all = data ?? [];
  const filtered = all.filter((school) => school.name.toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id")) && (coverage === "all" || (coverage === "empty" ? school.studentCount === 0 : school.studentCount > 0)));
  const unavailable = isLoading || isError;

  return (
    <ResearchPage>
      <ResearchHeader section="Sekolah" title="Sekolah dalam riset" description="Petakan cakupan guru, kelas, dan siswa pada setiap sekolah yang terdaftar." actions={<Button onPress={() => setCreateOpen(true)}><Plus size={16} aria-hidden="true" /> Tambah Sekolah</Button>} />
      <ResearchMetrics>
        <ResearchMetric label="Sekolah terdaftar" value={isError ? null : all.length} loading={isLoading} note="Seluruh sekolah dalam daftar" />
        <ResearchMetric label="Memiliki siswa" value={isError ? null : all.filter((school) => school.studentCount > 0).length} loading={isLoading} note="Sekolah dengan siswa terdaftar" index={1} />
        <ResearchMetric label="Cakupan kelas" value={isError ? null : all.reduce((sum, school) => sum + school.classCount, 0)} loading={isLoading} note="Total kelas lintas sekolah" index={2} />
        <ResearchMetric label="Cakupan siswa" value={isError ? null : all.reduce((sum, school) => sum + school.studentCount, 0)} loading={isLoading} note="Jumlah siswa per sekolah dijumlahkan" index={3} />
      </ResearchMetrics>
      <ResearchPanel title="Direktori sekolah" description="Kelola data sekolah dan identifikasi cakupan yang belum terisi.">
        <div className={styles.toolbar}>
          <ResearchSearch value={search} onChange={setSearch} label="Cari sekolah" placeholder="Cari nama sekolah…" />
          <ResearchSelect label="Cakupan siswa" value={coverage} onChange={setCoverage} disabled={unavailable} options={[{ value: "all", label: "Semua sekolah" }, { value: "populated", label: "Memiliki siswa" }, { value: "empty", label: "Belum ada siswa" }]} />
          {search || coverage !== "all" ? <Button size="sm" variant="tertiary" onPress={() => { setSearch(""); setCoverage("all"); }}>Reset filter</Button> : null}
        </div>
        {!unavailable ? <p role="status" className={`${styles.resultCount} mb-4`}>Menampilkan {filtered.length} dari {all.length} sekolah</p> : null}

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Gagal memuat daftar sekolah.</Alert.Description>
          </Alert.Content>
          <Button size="sm" variant="secondary" onPress={() => refetch()}>
            Coba lagi
          </Button>
        </Alert>
      ) : all.length > 0 && filtered.length === 0 ? <ResearchEmpty title="Tidak ada sekolah yang sesuai" description="Ubah kata pencarian atau filter cakupan untuk melihat sekolah lain." /> : (
        <SchoolsTable
          schools={filtered}
          onEdit={setEditingSchool}
          onDelete={setDeletingSchool}
        />
      )}
      </ResearchPanel>

      <Modal.Backdrop isOpen={createOpen} onOpenChange={setCreateOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Tambah Sekolah</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <CreateSchoolForm onCreated={() => setCreateOpen(false)} />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={editingSchool !== null}
        onOpenChange={(open) => { if (!open) setEditingSchool(null); }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Edit Sekolah</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {editingSchool ? (
                <EditSchoolForm
                  schoolId={editingSchool.id}
                  currentName={editingSchool.name}
                  onUpdated={() => setEditingSchool(null)}
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop
        isOpen={deletingSchool !== null}
        onOpenChange={(open) => { if (!open) setDeletingSchool(null); }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-110">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Hapus sekolah?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted">
                Sekolah akan diarsipkan. Guru yang masih terdaftar di sekolah ini tidak ikut
                terhapus dan tetap dapat login serta mengelola kelasnya seperti biasa.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Batal
              </Button>
              <Button
                variant="danger"
                isPending={deleteSchool.isPending}
                onPress={async () => {
                  if (!deletingSchool) return;
                  try {
                    await deleteSchool.mutateAsync(deletingSchool.id);
                    setDeletingSchool(null);
                    toast.success("Sekolah berhasil dihapus.");
                  } catch {
                    toast.danger("Sekolah gagal dihapus.");
                  }
                }}
              >
                Hapus
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </ResearchPage>
  );
}
