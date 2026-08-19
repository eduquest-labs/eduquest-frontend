"use client";

import { useState } from "react";

import { AlertDialog, Alert, Button, ComboBox, Input, Label, ListBox, Modal, Skeleton, toast } from "@heroui/react";

import { useDeactivateGuru } from "@/hooks/mutations";
import { useSchools, useSuperadminGuru } from "@/hooks/queries";
import { EditGuruForm } from "@/components/superadmin-guru/EditGuruForm";
import { GuruTable } from "@/components/superadmin-guru/GuruTable";
import { ReactivateGuruForm } from "@/components/superadmin-guru/ReactivateGuruForm";
import type { GuruWithStats } from "@/types";

export function GuruPageClient() {
  const [schoolFilter, setSchoolFilter] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useSuperadminGuru(schoolFilter ?? undefined);
  const schools = useSchools();
  const [editingGuru, setEditingGuru] = useState<GuruWithStats | null>(null);
  const [deactivatingGuru, setDeactivatingGuru] = useState<GuruWithStats | null>(null);
  const [reactivatingGuru, setReactivatingGuru] = useState<GuruWithStats | null>(null);
  const deactivateGuru = useDeactivateGuru();

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Guru</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola akun guru lintas sekolah: ubah data, nonaktifkan, atau aktifkan kembali.
        </p>
      </div>

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
      ) : (
        <GuruTable
          guru={data ?? []}
          onEdit={setEditingGuru}
          onDeactivate={setDeactivatingGuru}
          onReactivate={setReactivatingGuru}
        />
      )}

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
              <p className="text-sm text-slate-500">
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
    </div>
  );
}
