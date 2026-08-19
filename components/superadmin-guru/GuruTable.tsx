"use client";

import { Pencil, RotateCcw, Users as UsersIcon, UserX } from "lucide-react";

import { Button, Chip, Table } from "@heroui/react";

import type { GuruWithStats } from "@/types";

export interface GuruTableProps {
  guru: GuruWithStats[];
  onEdit: (guru: GuruWithStats) => void;
  onDeactivate: (guru: GuruWithStats) => void;
  onReactivate: (guru: GuruWithStats) => void;
}

export function GuruTable({ guru, onEdit, onDeactivate, onReactivate }: GuruTableProps) {
  if (guru.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 px-8 py-16 text-center dark:border-white/10">
        <span className="flex size-11 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/10 dark:text-slate-500">
          <UsersIcon size={20} strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Belum ada guru</p>
          <p className="max-w-xs text-sm text-slate-500 dark:text-slate-400">
            Guru akan muncul di sini setelah mereka mendaftar mandiri.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label="Daftar guru" className="min-w-[720px]">
          <Table.Header>
            <Table.Column isRowHeader>Nama</Table.Column>
            <Table.Column>Email</Table.Column>
            <Table.Column>Sekolah</Table.Column>
            <Table.Column>Jumlah Kelas</Table.Column>
            <Table.Column>Jumlah Siswa</Table.Column>
            <Table.Column>Status</Table.Column>
            <Table.Column>Aksi</Table.Column>
          </Table.Header>
          <Table.Body items={guru}>
            {(item) => (
              <Table.Row id={item.id}>
                <Table.Cell>{item.name}</Table.Cell>
                <Table.Cell>{item.email}</Table.Cell>
                <Table.Cell>{item.schoolName ?? "—"}</Table.Cell>
                <Table.Cell>{item.classCount}</Table.Cell>
                <Table.Cell>{item.studentCount}</Table.Cell>
                <Table.Cell>
                  <Chip color={item.isActive ? "success" : "danger"} size="sm">
                    {item.isActive ? "Aktif" : "Nonaktif"}
                  </Chip>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-1">
                    <Button size="sm" variant="tertiary" onPress={() => onEdit(item)}>
                      <Pencil size={15} /> Edit
                    </Button>
                    {item.isActive ? (
                      <Button
                        size="sm"
                        variant="tertiary"
                        className="text-danger"
                        onPress={() => onDeactivate(item)}
                      >
                        <UserX size={15} /> Nonaktifkan
                      </Button>
                    ) : (
                      <Button size="sm" variant="tertiary" onPress={() => onReactivate(item)}>
                        <RotateCcw size={15} /> Aktifkan
                      </Button>
                    )}
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
