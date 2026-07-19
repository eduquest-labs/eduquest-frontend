"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, Trophy, Users } from "lucide-react";

import {
  AlertDialog,
  Alert,
  Button,
  Modal,
  Skeleton,
  Table,
  toast,
  useOverlayState,
} from "@heroui/react";

import { useAddStudent, useRemoveStudent, useUpdateStudent } from "@/hooks/mutations";
import { useClassStudents } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { StudentForm } from "@/components/kelas/StudentForm";
import { StudentPointsPanel } from "@/components/points-badges";
import type { ClassStudent } from "@/types";

export interface ClassRosterTableProps {
  classId: number;
}

export function ClassRosterTable({ classId }: ClassRosterTableProps) {
  const { data, isLoading, isError } = useClassStudents(classId);
  const addStudent = useAddStudent(classId);
  const updateStudent = useUpdateStudent(classId);
  const removeStudent = useRemoveStudent(classId);

  const addModal = useOverlayState();
  const editModal = useOverlayState();
  const [studentToEdit, setStudentToEdit] = useState<ClassStudent | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<ClassStudent | null>(null);
  const [studentForPoints, setStudentForPoints] = useState<ClassStudent | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>Gagal memuat daftar siswa.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="secondary"
          onPress={addModal.open}
          className="flex items-center gap-1.5"
        >
          <Plus size={15} />
          Tambah Siswa
        </Button>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center dark:border-white/10">
          <Users size={18} className="text-slate-300 dark:text-slate-600" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Belum ada siswa. Impor atau tambah siswa untuk mulai.
          </p>
        </div>
      ) : (
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Daftar siswa" className="min-w-125">
              <Table.Header>
                <Table.Column isRowHeader>Nama</Table.Column>
                <Table.Column>NIS</Table.Column>
                <Table.Column>Status</Table.Column>
                <Table.Column>Aksi</Table.Column>
              </Table.Header>
              <Table.Body>
                {data.map((student) => (
                  <Table.Row key={student.id}>
                    <Table.Cell>{student.name}</Table.Cell>
                    <Table.Cell className="font-mono text-sm">{student.nis}</Table.Cell>
                    <Table.Cell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          student.isClaimed
                            ? "bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300"
                            : "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                        )}
                      >
                        {student.isClaimed ? "Aktif" : "Belum aktivasi"}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setStudentForPoints(student)}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-amber-500 transition-colors hover:bg-amber-50 hover:text-amber-700 dark:hover:bg-amber-400/10 dark:hover:text-amber-300"
                          aria-label={`Poin dan badge ${student.name}`}
                        >
                          <Trophy size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setStudentToEdit(student);
                            editModal.open();
                          }}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
                          aria-label={`Edit ${student.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setStudentToDelete(student)}
                          className="flex size-7 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-danger-soft hover:text-danger dark:hover:bg-danger-soft"
                          aria-label={`Hapus ${student.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      )}

      <Modal.Backdrop isOpen={addModal.isOpen} onOpenChange={addModal.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Tambah Siswa</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              <StudentForm
                submitLabel="Tambah Siswa"
                pendingLabel="Menambahkan..."
                isPending={addStudent.isPending}
                onSubmit={async (values) => {
                  await addStudent.mutateAsync(values);
                  addModal.close();
                  toast.success(`${values.name} berhasil ditambahkan.`);
                }}
              />
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <Modal.Backdrop
        isOpen={editModal.isOpen}
        onOpenChange={(isOpen) => {
          editModal.setOpen(isOpen);
          if (!isOpen) {
            setStudentToEdit(null);
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-105">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">Edit Siswa</Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {studentToEdit ? (
                <StudentForm
                  initialValues={{ name: studentToEdit.name, nis: studentToEdit.nis }}
                  submitLabel="Simpan Perubahan"
                  pendingLabel="Menyimpan..."
                  isPending={updateStudent.isPending}
                  onSubmit={async (values) => {
                    await updateStudent.mutateAsync({ studentId: studentToEdit.id, input: values });
                    editModal.close();
                    setStudentToEdit(null);
                    toast.success(`Data ${values.name} berhasil diperbarui.`);
                  }}
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop
        isOpen={studentToDelete !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setStudentToDelete(null);
          }
        }}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-100">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>
                Hapus {studentToDelete?.name} dari kelas?
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Siswa akan dihapus dari daftar kelas ini. Akun siswa tidak dihapus permanen.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Batal
              </Button>
              <Button
                slot="close"
                variant="danger"
                isPending={removeStudent.isPending}
                onPress={() => {
                  if (studentToDelete) {
                    const name = studentToDelete.name;
                    removeStudent.mutate(studentToDelete.id, {
                      onSuccess: () => toast.success(`${name} berhasil dihapus dari kelas.`),
                      onError: () => toast.danger(`Gagal menghapus ${name}.`),
                    });
                  }
                }}
              >
                Hapus
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      <Modal.Backdrop
        isOpen={studentForPoints !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setStudentForPoints(null);
          }
        }}
      >
        <Modal.Container>
          <Modal.Dialog className="max-h-[90dvh] overflow-y-auto sm:max-w-140">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="text-base font-semibold">
                Poin & Badge {studentForPoints?.name}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {studentForPoints ? (
                <StudentPointsPanel
                  classId={classId}
                  classStudentId={studentForPoints.id}
                />
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
