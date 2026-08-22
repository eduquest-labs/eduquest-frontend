"use client";

import { useState } from "react";
import { Button, Label, TextArea, TextField } from "@heroui/react";

import { useOverrideTermProgress } from "@/hooks/mutations";
import type { StudentTermProgressEntry, TermProgressStatus } from "@/types";

export interface TermOverrideFormProps {
  termId: number;
  student: StudentTermProgressEntry;
  onDone: () => void;
}

const STATUS_OPTIONS: { value: TermProgressStatus; label: string }[] = [
  { value: "passed", label: "Lulus" },
  { value: "failed", label: "Tidak lulus" },
  { value: "in_progress", label: "Masih berjalan" },
];

export function TermOverrideForm({ termId, student, onDone }: TermOverrideFormProps) {
  const [status, setStatus] = useState<TermProgressStatus>(student.status);
  const [feedback, setFeedback] = useState(student.feedback ?? "");
  const override = useOverrideTermProgress(termId);

  async function handleOverride() {
    await override.mutateAsync({ classStudentId: student.classStudentId, status, feedback: feedback || undefined });
    onDone();
  }

  async function handleResetToAuto() {
    await override.mutateAsync({ classStudentId: student.classStudentId, status: null });
    onDone();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label>Status untuk {student.studentName}</Label>
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.value}
              size="sm"
              variant={status === option.value ? "primary" : "secondary"}
              onPress={() => setStatus(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>
      <TextField value={feedback} onChange={setFeedback}>
        <Label>Feedback (opsional)</Label>
        <TextArea rows={2} />
      </TextField>
      <div className="flex gap-2">
        <Button isPending={override.isPending} onPress={handleOverride} className="bg-teal-600 text-white hover:bg-teal-700">
          Simpan override
        </Button>
        {student.source === "override" ? (
          <Button variant="secondary" isPending={override.isPending} onPress={handleResetToAuto}>
            Kembalikan ke otomatis
          </Button>
        ) : null}
      </div>
    </div>
  );
}
