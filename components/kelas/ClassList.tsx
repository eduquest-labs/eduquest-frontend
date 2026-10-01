"use client";

import { School } from "lucide-react";

import { Alert, Button, Skeleton } from "@heroui/react";

import { useClasses } from "@/hooks/queries";
import { ClassCard } from "@/components/kelas/ClassCard";

export function ClassList() {
  const { data, isLoading, isError, refetch } = useClasses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 dark:border-border dark:bg-surface-secondary"
          >
            <Skeleton className="h-5 w-3/5 rounded" />
            <Skeleton className="h-9 w-full rounded-lg" />
            <Skeleton className="h-4 w-1/3 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>Gagal memuat daftar kelas.</Alert.Description>
        </Alert.Content>
        <Button size="sm" variant="secondary" onPress={() => refetch()}>
          Coba lagi
        </Button>
      </Alert>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-8 py-16 text-center dark:border-border">
        <span className="flex size-11 items-center justify-center rounded-full bg-ink-100 text-ink-400 dark:bg-surface-secondary dark:text-muted">
          <School size={20} strokeWidth={2} />
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">Belum ada kelas</p>
          <p className="max-w-xs text-sm text-muted">
            Buat kelas pertama Anda untuk mulai mengundang siswa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((kelas) => (
        <ClassCard key={kelas.id} kelas={kelas} />
      ))}
    </div>
  );
}
