"use client";

import { isAxiosError } from "axios";
import { Users } from "lucide-react";

import { Alert, Skeleton } from "@heroui/react";

import { useClass } from "@/hooks/queries";
import { ClassCodeReveal } from "@/components/kelas/ClassCodeReveal";
import { ClassRosterTable } from "@/components/kelas/ClassRosterTable";
import { ImportStudentsForm } from "@/components/kelas/ImportStudentsForm";

export interface KelasDetailPageClientProps {
  classId: number;
}

export function KelasDetailPageClient({ classId }: KelasDetailPageClientProps) {
  const { data, isLoading, isError, error } = useClass(classId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-4 sm:p-6">
        <Skeleton className="h-8 w-2/3 rounded-lg" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError) {
    const status = isAxiosError(error) ? error.response?.status : undefined;
    const message =
      status === 403
        ? "Anda tidak memiliki akses ke kelas ini."
        : status === 404
          ? "Kelas tidak ditemukan."
          : "Gagal memuat data kelas.";

    return (
      <div className="p-4 sm:p-6">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>{message}</Alert.Description>
          </Alert.Content>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{data.name}</h1>
        <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
          <Users size={13} />
          {data.studentCount} siswa
        </div>
      </div>

      <div className="max-w-sm">
        <ClassCodeReveal classCode={data.classCode} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Impor Siswa</h2>
        <ImportStudentsForm classId={classId} />
      </div>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">Daftar Siswa</h2>
        <ClassRosterTable classId={classId} />
      </div>
    </div>
  );
}
