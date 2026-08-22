"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AlertDialog, Alert, Button, Input, Label, ListBox, Modal, Select, Skeleton, TextField, toast, useOverlayState } from "@heroui/react";

import { useCreateChallengeGroup, useDeleteChallengeGroup, useGradeChallengeGroup } from "@/hooks/mutations";
import { useChallengeGroups, useClassStudents } from "@/hooks/queries";
import type { ChallengeGroup } from "@/types";

export interface ChallengeGroupManagerProps {
  challengeId: number;
  classId: number;
}

function GradeForm({ challengeId, groupId, onDone }: { challengeId: number; groupId: number; onDone: () => void }) {
  const [score, setScore] = useState("");
  const grade = useGradeChallengeGroup(challengeId);

  return (
    <div className="flex items-center gap-2">
      <TextField value={score} onChange={setScore} className="w-24">
        <Input type="number" placeholder="0-100" />
      </TextField>
      <Button
        size="sm"
        isPending={grade.isPending}
        isDisabled={!score || Number(score) < 0 || Number(score) > 100}
        onPress={async () => {
          await grade.mutateAsync({ groupId, groupScore: Number(score) });
          toast.success("Kelompok berhasil dinilai.");
          onDone();
        }}
      >
        Nilai
      </Button>
    </div>
  );
}

function GroupCard({ challengeId, group }: { challengeId: number; group: ChallengeGroup }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteGroup = useDeleteChallengeGroup(challengeId);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-slate-200 p-4 dark:border-white/10">
      <div className="flex items-center justify-between">
        <p className="font-medium text-slate-900 dark:text-white">{group.name}</p>
        <div className="flex items-center gap-2">
          {group.groupScore !== null ? <span className="text-sm font-semibold text-teal-700">{group.groupScore}%</span> : null}
          <Button
            size="sm"
            variant="tertiary"
            className="text-danger"
            aria-label="Hapus kelompok"
            onPress={() => setConfirmDelete(true)}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>
      <p className="text-xs text-slate-500">{group.members.map((member) => member.studentName).join(", ") || "Belum ada anggota"}</p>
      {group.groupScore === null ? <GradeForm challengeId={challengeId} groupId={group.id} onDone={() => {}} /> : null}

      <AlertDialog.Backdrop isOpen={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-110">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Hapus kelompok?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p className="text-sm text-slate-500">
                Kelompok &quot;{group.name}&quot; akan dihapus. Jika kelompok ini sudah dinilai, status kelulusan termin anggotanya akan dihitung ulang.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">Batal</Button>
              <Button
                variant="danger"
                isPending={deleteGroup.isPending}
                onPress={async () => {
                  await deleteGroup.mutateAsync(group.id);
                  setConfirmDelete(false);
                  toast.success("Kelompok berhasil dihapus.");
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

export function ChallengeGroupManager({ challengeId, classId }: ChallengeGroupManagerProps) {
  const groups = useChallengeGroups(challengeId);
  const classStudents = useClassStudents(classId);
  const createOverlay = useOverlayState();
  const createGroup = useCreateChallengeGroup(challengeId);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [studentQuery, setStudentQuery] = useState("");
  const filteredStudents = (classStudents.data ?? []).filter((student) =>
    student.name.toLowerCase().includes(studentQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Kelompok</h3>
        <Button size="sm" variant="secondary" onPress={createOverlay.open}>Buat Kelompok</Button>
      </div>

      {groups.isLoading ? <Skeleton className="h-24 w-full rounded-xl" /> : null}
      {groups.isError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Kelompok gagal dimuat.</Alert.Description></Alert.Content></Alert>
      ) : null}
      {!groups.isLoading && !groups.isError && groups.data?.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada kelompok untuk challenge ini.</p>
      ) : null}
      {groups.data?.map((group) => (
        <GroupCard key={group.id} challengeId={challengeId} group={group} />
      ))}

      <Modal.Backdrop isOpen={createOverlay.isOpen} onOpenChange={createOverlay.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-110">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Buat Kelompok</Modal.Heading></Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <TextField value={name} onChange={setName}>
                <Label>Nama kelompok</Label>
                <Input />
              </TextField>
              <div className="flex flex-col gap-2">
                {classStudents.isLoading ? <Skeleton className="h-10 w-full rounded-lg" /> : null}
                {classStudents.data ? (
                  <Select
                    selectionMode="multiple"
                    value={selectedIds}
                    onChange={(keys) => setSelectedIds(Array.from(keys ?? []).map(Number))}
                    onOpenChange={(isOpen) => {
                      if (!isOpen) {
                        setStudentQuery("");
                      }
                    }}
                    placeholder="Belum ada anggota dipilih"
                  >
                    <Label>Anggota</Label>
                    <Select.Trigger>
                      <Select.Value />
                      <Select.Indicator />
                    </Select.Trigger>
                    <Select.Popover className="flex flex-col gap-2 p-2">
                      <TextField value={studentQuery} onChange={setStudentQuery}>
                        <Input placeholder="Cari nama siswa..." />
                      </TextField>
                      <ListBox selectionMode="multiple" className="max-h-48 overflow-y-auto">
                        {filteredStudents.map((student) => (
                          <ListBox.Item key={student.id} id={student.id} textValue={student.name}>
                            {student.name}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </Select.Popover>
                  </Select>
                ) : null}
              </div>
              <Button
                isPending={createGroup.isPending}
                isDisabled={!name || selectedIds.length === 0}
                onPress={async () => {
                  await createGroup.mutateAsync({ name, classStudentIds: selectedIds });
                  createOverlay.close();
                  setName("");
                  setSelectedIds([]);
                  toast.success("Kelompok berhasil dibuat.");
                }}
                className="bg-teal-600 text-white hover:bg-teal-700"
              >
                Buat Kelompok
              </Button>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  );
}
