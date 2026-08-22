"use client";

import { useState } from "react";
import { Alert, Button, Chip, Modal, Skeleton, toast, useOverlayState } from "@heroui/react";

import { useUpdateTerm } from "@/hooks/mutations";
import { useTermProgress } from "@/hooks/queries";
import { TermForm } from "@/components/term/TermForm";
import { TermOverrideForm } from "@/components/term/TermOverrideForm";
import { TermThresholdHistoryList } from "@/components/term/TermThresholdHistoryList";
import type { StudentTermProgressEntry, Term } from "@/types";

const STATUS_CHIP: Record<string, "success" | "danger" | "warning"> = {
  passed: "success",
  failed: "danger",
  in_progress: "warning",
};

const STATUS_LABEL: Record<string, string> = {
  passed: "Lulus",
  failed: "Tidak lulus",
  in_progress: "Berjalan",
};

export interface TermManagePanelProps {
  classId: number;
  term: Term;
}

export function TermManagePanel({ classId, term }: TermManagePanelProps) {
  const overlay = useOverlayState();
  const progress = useTermProgress(term.id, overlay.isOpen);
  const updateTerm = useUpdateTerm(classId);
  const [overriding, setOverriding] = useState<StudentTermProgressEntry | null>(null);

  return (
    <>
      <Button size="sm" variant="secondary" onPress={overlay.open}>Kelola Termin</Button>
      <Modal.Backdrop isOpen={overlay.isOpen} onOpenChange={overlay.setOpen}>
        <Modal.Container size="lg">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Kelola {term.name}</Modal.Heading></Modal.Header>
            <Modal.Body className="flex flex-col gap-6">
              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Threshold Kelulusan</h3>
                <TermForm
                  term={term}
                  isPending={updateTerm.isPending}
                  onSubmit={async (input) => {
                    await updateTerm.mutateAsync({ termId: term.id, input });
                    toast.success("Termin berhasil diperbarui.");
                  }}
                />
                <TermThresholdHistoryList termId={term.id} />
              </section>

              <section className="flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Status Siswa</h3>
                {progress.isLoading ? <Skeleton className="h-32 w-full rounded-lg" /> : null}
                {progress.isError ? (
                  <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Status siswa gagal dimuat.</Alert.Description></Alert.Content></Alert>
                ) : null}
                {progress.data?.map((student) => (
                  <div key={student.classStudentId} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 dark:border-white/10">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{student.studentName}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Chip size="sm" color={STATUS_CHIP[student.status]}>{STATUS_LABEL[student.status]}</Chip>
                        {student.source === "override" ? <span className="text-xs text-slate-500">Override manual</span> : null}
                      </div>
                    </div>
                    <Button size="sm" variant="tertiary" onPress={() => setOverriding(student)}>Override</Button>
                  </div>
                ))}
              </section>

              {overriding ? (
                <section className="border-t border-slate-200 pt-4 dark:border-white/10">
                  <TermOverrideForm
                    termId={term.id}
                    student={overriding}
                    onDone={() => {
                      setOverriding(null);
                      toast.success("Status berhasil diubah.");
                    }}
                  />
                </section>
              ) : null}
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
