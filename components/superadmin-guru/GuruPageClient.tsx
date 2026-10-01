"use client";

import { ResearchSelect } from "@/components/superadmin-shared/ResearchSelect";
import { useState } from "react";

import { AlertDialog, Alert, Button, ComboBox, Input, Label, ListBox, Modal, Skeleton, toast } from "@heroui/react";

import { useDeactivateGuru } from "@/hooks/mutations";
import { useSchools, useSuperadminGuru } from "@/hooks/queries";
import { EditGuruForm } from "@/components/superadmin-guru/EditGuruForm";
import { GuruTable } from "@/components/superadmin-guru/GuruTable";
import { ReactivateGuruForm } from "@/components/superadmin-guru/ReactivateGuruForm";
import type { GuruWithStats } from "@/types";
import { ResearchEmpty, ResearchHeader, ResearchMetric, ResearchMetrics, ResearchPage, ResearchPanel, ResearchSearch, researchStyles as styles } from "@/components/superadmin-shared/ResearchUI";

export function GuruPageClient() {
  const [schoolFilter, setSchoolFilter] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useSuperadminGuru(schoolFilter ?? undefined);
  const schools = useSchools();
  const [editingGuru, setEditingGuru] = useState<GuruWithStats | null>(null);
  const [deactivatingGuru, setDeactivatingGuru] = useState<GuruWithStats | null>(null);
  const [reactivatingGuru, setReactivatingGuru] = useState<GuruWithStats | null>(null);
  const deactivateGuru = useDeactivateGuru();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const all = data ?? [];
  const filtered = all.filter((guru) => [guru.name, guru.email, guru.schoolName ?? ""].some((value) => value.toLocaleLowerCase("id").includes(search.trim().toLocaleLowerCase("id"))) && (status === "all" || (status === "active" ? guru.isActive : !guru.isActive)));

  return (
    <ResearchPage>
      <ResearchHeader section="Guru" title="Guru pendamping riset" description="Tinjau status akun dan cakupan kelas guru, lalu kelola akses sesuai kebutuhan sekolah." />
      <ResearchMetrics>
        <ResearchMetric label="Guru terdaftar" value={isError ? null : all.length} loading={isLoading} note="Pada sekolah yang dipilih" />
        <ResearchMetric label="Akun aktif" value={isError ? null : all.filter((guru) => guru.isActive).length} loading={isLoading} note="Dapat mengakses ruang guru" index={1} />
        <ResearchMetric label="Akun nonaktif" value={isError ? null : all.filter((guru) => !guru.isActive).length} loading={isLoading} note="Memerlukan pengaktifan ulang" index={2} />
        <ResearchMetric label="Cakupan kelas" value={isError ? null : all.reduce((sum, guru) => sum + guru.classCount, 0)} loading={isLoading} note="Kelas seluruh guru dalam pilihan sekolah" index={3} />
      </ResearchMetrics>
      <ResearchPanel title="Direktori guru" description="Cari nama, email, atau sekolah. Ringkasan di atas mengikuti pilihan sekolah.">
      <div className={styles.toolbar}>
      <ResearchSearch value={search} onChange={setSearch} label="Cari guru" placeholder="Cari nama, email, atau sekolah…" />

      <ComboBox
        selectedKey={schoolFilter}
        onSelectionChange={(key) => setSchoolFilter(key === null ? null : Number(key))}
        isDisabled={schools.isLoading}
        className="max-w-xs"
      >
        <Label>Filter sekolah</Label>
        <ComboBox.InputGroup>
          <Input placeholder="Semua sekolah" />
          <ComboBox.Trigger />
        </ComboBox.InputGroup>
        <ComboBox.Popover>
          <ListBox>
            {(schools.data ?? []).map((school) => (
              <ListBox.Item key={school.id} id={school.id} textValue={school.name}>
                {school.name}
                <ListBox.ItemIndicator />
              </ListBox.Item>
            ))}
          </ListBox>
        </ComboBox.Popover>
      </ComboBox>
      <ResearchSelect label="Status akun" value={status} onChange={setStatus} options={[{ value: "all", label: "Semua status" }, { value: "active", label: "Aktif" }, { value: "inactive", label: "Nonaktif" }]} />
      {search || status !== "all" || schoolFilter !== null ? <Button size="sm" variant="tertiary" onPress={() => { setSearch(""); setStatus("all"); setSchoolFilter(null); }}>Reset filter</Button> : null}
      </div>
      {schools.isError ? <Alert status="warning"><Alert.Content><Alert.Description>Daftar filter sekolah gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => schools.refetch()}>Muat ulang sekolah</Button></Alert> : null}
      {!isLoading && !isError ? <p role="status" className={`${styles.resultCount} mb-4`}>Menampilkan {filtered.length} dari {all.length} guru pada pilihan sekolah</p> : null}

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
            <Alert.Description>Gagal memuat daftar guru.</Alert.Description>
          </Alert.Content>
          <Button size="sm" variant="secondary" onPress={() => refetch()}>
            Coba lagi
          </Button>
        </Alert>
      ) : all.length > 0 && filtered.length === 0 ? <ResearchEmpty title="Tidak ada guru yang sesuai" description="Ubah pencarian atau filter status akun untuk melihat guru lain." /> : (
        <GuruTable
          guru={filtered}
          onEdit={setEditingGuru}
          onDeactivate={setDeactivatingGuru}
          onReactivate={setReactivatingGuru}
        />
      )}
      </ResearchPanel>

      <Modal.Backdrop
        isOpen={editingGuru !== null}
        onOpenChange={(open) => { if (!open) setEditingGuru(null); }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Edit Guru</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {editingGuru ? (
                <EditGuruForm
                  guru={{
                    id: editingGuru.id,
                    name: editingGuru.name,
                    email: editingGuru.email,
                    schoolId: editingGuru.schoolId,
                  }}
                  onUpdated={() => setEditingGuru(null)}
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={reactivatingGuru !== null}
        onOpenChange={(open) => { if (!open) setReactivatingGuru(null); }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Aktifkan Kembali Guru</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {reactivatingGuru ? (
                <ReactivateGuruForm
                  guruId={reactivatingGuru.id}
                  onReactivated={() => setReactivatingGuru(null)}
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop
        isOpen={deactivatingGuru !== null}
        onOpenChange={(open) => { if (!open) setDeactivatingGuru(null); }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-110">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Nonaktifkan guru?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-muted">
                Guru tidak akan bisa login lagi sampai diaktifkan ulang. Kelas dan siswa yang
                sudah terdaftar di bawah guru ini tidak terhapus.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Batal
              </Button>
              <Button
                variant="danger"
                isPending={deactivateGuru.isPending}
                onPress={async () => {
                  if (!deactivatingGuru) return;
                  try {
                    await deactivateGuru.mutateAsync(deactivatingGuru.id);
                    setDeactivatingGuru(null);
                    toast.success("Guru berhasil dinonaktifkan.");
                  } catch {
                    toast.danger("Guru gagal dinonaktifkan.");
                  }
                }}
              >
                Nonaktifkan
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </ResearchPage>
  );
}
