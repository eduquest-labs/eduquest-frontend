"use client";

import Link from "next/link";
import { CalendarClock, History } from "lucide-react";
import { Alert, Button, Card, Chip, Skeleton } from "@heroui/react";

import { useAttemptHistory } from "@/hooks/queries";
import type { AttemptHistoryItem } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

function formatDate(value: string | null): string {
  return value ? DATE_FORMATTER.format(new Date(value)) : "Belum selesai";
}

function AttemptStatus({ attempt }: { attempt: AttemptHistoryItem }) {
  if (!attempt.isLocked) {
    return <Chip size="sm">Belum selesai</Chip>;
  }

  if (attempt.gradingStatus === "pending") {
    return <Chip size="sm" color="warning" variant="soft">Menunggu penilaian</Chip>;
  }

  return <Chip size="sm" color="success" variant="soft">Selesai</Chip>;
}

export function AttemptHistoryPageClient() {
  const history = useAttemptHistory();
  const attempts = history.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="min-h-dvh overflow-hidden bg-slate-50 dark:bg-black">
      <header className="border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-bold text-slate-900 dark:text-white">EduQuest Siswa</p>
            <p className="text-xs text-slate-500">Riwayat aktivitas</p>
          </div>
          <Link href="/siswa" className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-400/10">
            Kembali
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Riwayat Aktivitas</h1>
          <p className="mt-1 text-sm text-slate-500">
            Semua pengerjaan challenge Anda tersimpan di sini sebagai catatan read-only.
          </p>
        </div>

        {history.isLoading ? (
          <div className="flex flex-col gap-4" aria-label="Memuat riwayat aktivitas">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-44 w-full rounded-2xl" />)}
          </div>
        ) : null}

        {history.isError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>Riwayat aktivitas gagal dimuat.</Alert.Description>
            </Alert.Content>
            <Button size="sm" variant="secondary" onPress={() => history.refetch()}>Coba lagi</Button>
          </Alert>
        ) : null}

        {!history.isLoading && !history.isError && attempts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/10">
            <History size={28} className="text-slate-300" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Belum ada aktivitas</p>
              <p className="mt-1 text-sm text-slate-500">Attempt akan muncul setelah Anda membuka challenge.</p>
            </div>
          </div>
        ) : null}

        {attempts.length > 0 ? (
          <div className="flex flex-col gap-4">
            {attempts.map((attempt) => (
              <Card key={attempt.id} className="items-stretch overflow-hidden">
                <Card.Header>
                  <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <Card.Title className="break-words">{attempt.challenge.title}</Card.Title>
                      <Card.Description className="break-words">
                        {attempt.class.name} · {attempt.topic.name}
                      </Card.Description>
                    </div>
                    <div className="shrink-0"><AttemptStatus attempt={attempt} /></div>
                  </div>
                </Card.Header>
                <Card.Content className="grid gap-4 text-sm sm:grid-cols-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mulai</p>
                    <p className="mt-1 break-words text-slate-700 dark:text-slate-200">{formatDate(attempt.startedAt)}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Selesai</p>
                    <p className="mt-1 break-words text-slate-700 dark:text-slate-200">{formatDate(attempt.finishedAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Skor</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">
                      {attempt.totalScore === null ? "Belum tersedia" : `${attempt.totalScore} poin`}
                    </p>
                  </div>
                </Card.Content>
              </Card>
            ))}
          </div>
        ) : null}

        {history.hasNextPage ? (
          <Button
            className="min-h-11"
            variant="secondary"
            isPending={history.isFetchingNextPage}
            isDisabled={history.isFetchingNextPage}
            onPress={() => history.fetchNextPage()}
          >
            <CalendarClock size={16} /> Muat lebih banyak
          </Button>
        ) : null}
      </main>
    </div>
  );
}
