"use client";

import { Pencil, School as SchoolIcon, Trash2 } from "lucide-react";

import { Button, Table } from "@heroui/react";

import type { SchoolWithStats } from "@/types";

export interface SchoolsTableProps {
  schools: SchoolWithStats[];
  onEdit: (school: SchoolWithStats) => void;
  onDelete: (school: SchoolWithStats) => void;
}

export function SchoolsTable({ schools, onEdit, onDelete }: SchoolsTableProps) {
  if (schools.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-8 py-16 text-center dark:border-border">
        <span className="flex size-11 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-surface-secondary dark:text-muted">
          <SchoolIcon size={20} strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">Belum ada sekolah</p>
          <p className="max-w-xs text-sm text-muted">
            Tambahkan sekolah pertama agar guru dapat memilihnya saat mendaftar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Daftar sekolah" className="min-w-[600px]">
          <Table.Header>
            <Table.Column isRowHeader>Nama Sekolah</Table.Column>
            <Table.Column>Jumlah Guru</Table.Column>
            <Table.Column>Jumlah Kelas</Table.Column>
            <Table.Column>Jumlah Siswa</Table.Column>
            <Table.Column>Aksi</Table.Column>
          </Table.Header>
          <Table.Body items={schools}>
            {(school) => (
              <Table.Row id={school.id}>
                <Table.Cell>{school.name}</Table.Cell>
                <Table.Cell>{school.guruCount}</Table.Cell>
                <Table.Cell>{school.classCount}</Table.Cell>
                <Table.Cell>{school.studentCount}</Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="tertiary" onPress={() => onEdit(school)}>
                      <Pencil size={15} /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="tertiary"
                      className="text-danger"
                      onPress={() => onDelete(school)}
                    >
                      <Trash2 size={15} /> Hapus
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
