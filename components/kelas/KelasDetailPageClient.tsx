"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BookOpen, Download, Pencil, Trash2, Users } from "lucide-react";

import {
  AlertDialog,
  Alert,
  Button,
  Label,
  ListBox,
  Modal,
  Select,
  Skeleton,
  toast,
  useOverlayState,
} from "@heroui/react";

import { useDeleteClass, useExportClassGrades } from "@/hooks/mutations";
import { useClass } from "@/hooks/queries";
import { ClassCodeReveal } from "@/components/kelas/ClassCodeReveal";
import { ClassRosterTable } from "@/components/kelas/ClassRosterTable";
import { EditClassForm } from "@/components/kelas/EditClassForm";
import { ImportStudentsForm } from "@/components/kelas/ImportStudentsForm";
import type { GradeExportFormat, GradeExportIdentity } from "@/types";

export interface KelasDetailPageClientProps {
  classId: number;
}

export function KelasDetailPageClient({ classId }: KelasDetailPageClientProps) {
  const router = useRouter();
  const { data, isLoading, isError, error } = useClass(classId);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportFormat, setExportFormat] = useState<GradeExportFormat>("xlsx");
  const [exportIdentity, setExportIdentity] = useState<GradeExportIdentity>("anonymous");
  const editOverlay = useOverlayState();
  const deleteClass = useDeleteClass();
  const exportGrades = useExportClassGrades(classId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const message =
      status === 403
        ? "Anda tidak memiliki akses ke kelas ini."
        : status === 404
          ? "Kelas tidak ditemukan."
          : "Gagal memuat data kelas.";

    return (
      <div className="p-4 sm:p-6">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{message}</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{data.name}</h1>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Users size={13} />
            {data.studentCount} siswa
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="tertiary" onPress={editOverlay.open}>
            <Pencil size={15} /> Edit
          </Button>
          <Button
            size="sm"
            variant="tertiary"
            className="text-danger"
            onPress={() => setConfirmDelete(true)}
          >
            <Trash2 size={15} /> Hapus
          </Button>
        </div>
      </div>

      <div className="max-w-sm">
        <ClassCodeReveal classCode={data.classCode} />
      </div>

      <Link href={`/guru/authoring?classId=${classId}`} className="flex w-fit items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700">
        <BookOpen size={16} /> Kelola Materi & Tantangan
      </Link>

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">
            Ekspor Data Nilai
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Mode anonim adalah pilihan aman bawaan. Gunakan mode bernama hanya saat identitas siswa memang dibutuhkan.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select
            aria-label="Format ekspor data nilai"
            className="w-full sm:w-48"
            value={exportFormat}
            variant="secondary"
            onChange={(key) => {
              if (key === "csv" || key === "xlsx") {
                setExportFormat(key);
              }
            }}
          >
            <Label>Format file</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="xlsx" textValue="XLSX">
                  XLSX
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="csv" textValue="CSV">
                  CSV
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Select
            aria-label="Identitas pada ekspor data nilai"
            className="w-full sm:w-56"
            value={exportIdentity}
            variant="secondary"
            onChange={(key) => {
              if (key === "anonymous" || key === "named") setExportIdentity(key);
            }}
          >
            <Label>Identitas siswa</Label>
            <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="anonymous" textValue="Anonim (disarankan)">Anonim (disarankan)<ListBox.ItemIndicator /></ListBox.Item>
                <ListBox.Item id="named" textValue="Nama dan NISN">Nama dan NISN<ListBox.ItemIndicator /></ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
          <Button
            fullWidth
            className="bg-teal-600 text-white hover:bg-teal-700 sm:w-auto"
            isDisabled={exportGrades.isPending}
            isPending={exportGrades.isPending}
            onPress={async () => {
              try {
                await exportGrades.mutateAsync({ format: exportFormat, identity: exportIdentity });
                toast.success("Data nilai berhasil diunduh.");
              } catch {
                toast.danger("Data nilai gagal diekspor. Silakan coba lagi.");
              }
            }}
          >
            {({ isPending }) => (
              <>
                <Download size={16} />
                {isPending ? "Menyiapkan file..." : "Ekspor Data Nilai"}
              </>
            )}
          </Button>
        </div>
      </section>

      <Modal.Backdrop isOpen={editOverlay.isOpen} onOpenChange={editOverlay.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Edit Kelas</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <EditClassForm
                classId={classId}
                currentName={data.name}
                onUpdated={() => editOverlay.close()}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop isOpen={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-110">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Hapus kelas?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-slate-500">
                Kelas akan diarsipkan dan tidak lagi tampil di daftar kelas Anda. Data siswa dan
                riwayat riset yang sudah tersimpan tidak akan dihapus permanen.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Batal
              </Button>
              <Button
                variant="danger"
                isPending={deleteClass.isPending}
                onPress={async () => {
                  try {
                    await deleteClass.mutateAsync(classId);
                    setConfirmDelete(false);
                    toast.success("Kelas berhasil dihapus.");
                    router.push("/guru/kelas");
                  } catch {
                    toast.danger("Kelas gagal dihapus.");
                  }
                }}
              >
                Hapus
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Impor Siswa</h2>
        <ImportStudentsForm classId={classId} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Daftar Siswa</h2>
        <ClassRosterTable classId={classId} />
      </div>
    </div>
  );
}
