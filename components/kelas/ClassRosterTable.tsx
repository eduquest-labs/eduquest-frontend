"use client";

import { Users } from "lucide-react";

import { Alert, Skeleton, Table } from "@heroui/react";

import { useClassStudents } from "@/hooks/queries";
import { cn } from "@/lib/utils";

export interface ClassRosterTableProps {
  classId: number;
}

export function ClassRosterTable({ classId }: ClassRosterTableProps) {
  const { data, isLoading, isError } = useClassStudents(classId);

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

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-200 px-6 py-10 text-center dark:border-white/10">
        <Users size={18} className="text-slate-300 dark:text-slate-600" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Belum ada siswa. Impor daftar siswa untuk mulai.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Daftar siswa" className="min-w-100">
          <Table.Header>
            <Table.Column isRowHeader>Nama</Table.Column>
            <Table.Column>NIS</Table.Column>
            <Table.Column>Status</Table.Column>
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
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
