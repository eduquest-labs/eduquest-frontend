"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AlertDialog, Alert, Button, Modal, Skeleton, toast } from "@heroui/react";

import { useDeleteSchool } from "@/hooks/mutations";
import { useSuperadminSchools } from "@/hooks/queries";
import { CreateSchoolForm } from "@/components/superadmin-schools/CreateSchoolForm";
import { EditSchoolForm } from "@/components/superadmin-schools/EditSchoolForm";
import { SchoolsTable } from "@/components/superadmin-schools/SchoolsTable";
import type { SchoolWithStats } from "@/types";

export function SchoolsPageClient() {
  const { data, isLoading, isError, refetch } = useSuperadminSchools();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<SchoolWithStats | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<SchoolWithStats | null>(null);
  const deleteSchool = useDeleteSchool();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Sekolah</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Kelola daftar sekolah yang dapat dipilih guru saat mendaftar.
          </p>
        </div>

        <Button
          className="flex items-center gap-1.5 bg-teal-600 text-white hover:bg-teal-700"
          onPress={() => setCreateOpen(true)}
        >
          <Plus size={16} />
          Tambah Sekolah
        </Button>
      </div>

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
      ) : (
        <SchoolsTable
          schools={data ?? []}
          onEdit={setEditingSchool}
          onDelete={setDeletingSchool}
        />
      )}

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
              <p className="text-sm text-slate-500">
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
    </div>
  );
}
