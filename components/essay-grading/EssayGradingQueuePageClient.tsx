"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ClipboardCheck } from "lucide-react";
import { Alert, Button, Card, Chip, Skeleton } from "@heroui/react";

import { useClasses, usePendingGradingAttempts } from "@/hooks/queries";

const LAST_CLASS_KEY = "eduquest:grading:last-class";

interface EssayGradingQueuePageClientProps {
  initialClassId: number | null;
}

export function EssayGradingQueuePageClient({ initialClassId }: EssayGradingQueuePageClientProps) {
  const router = useRouter();
  const classes = useClasses();
  const validClassIds = useMemo(
    () => new Set(classes.data?.map((item) => item.id) ?? []),
    [classes.data]
  );
  const selectedClassId =
    initialClassId !== null && validClassIds.has(initialClassId) ? initialClassId : null;
  const queue = usePendingGradingAttempts(selectedClassId ?? 0, selectedClassId !== null);
  const attempts = queue.data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    if (!classes.data?.length) return;
    if (initialClassId !== null && validClassIds.has(initialClassId)) {
      sessionStorage.setItem(LAST_CLASS_KEY, String(initialClassId));
      return;
    }
    const remembered = Number(sessionStorage.getItem(LAST_CLASS_KEY));
    const nextId = validClassIds.has(remembered) ? remembered : classes.data[0].id;
    router.replace(`/dosen/grading?classId=${nextId}`);
  }, [classes.data, initialClassId, router, validClassIds]);

  function selectClass(classId: number) {
    sessionStorage.setItem(LAST_CLASS_KEY, String(classId));
    router.replace(`/dosen/grading?classId=${classId}`);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Penilaian Esai</h1>
        <p className="mt-1 text-sm text-slate-500">
          Selesaikan antrean jawaban esai per kelas agar nilai akhir siswa dapat ditampilkan.
        </p>
      </div>

      {classes.isLoading ? <Skeleton className="h-20 w-full rounded-xl" /> : null}
      {classes.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>Daftar kelas gagal dimuat.</Alert.Description></Alert.Content>
        </Alert>
      ) : null}
      {classes.data?.length === 0 ? (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>Belum ada kelas yang dapat dinilai.</Alert.Description></Alert.Content>
        </Alert>
      ) : null}
      {classes.data?.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <label className="flex max-w-md flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            Kelas aktif
            <select
              value={selectedClassId ?? ""}
              onChange={(event) => selectClass(Number(event.target.value))}
              className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-black"
            >
              {classes.data.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>{kelas.name}</option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      {queue.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}
        </div>
      ) : null}
      {queue.isError ? (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>Antrean penilaian gagal dimuat.</Alert.Description></Alert.Content>
          <Button size="sm" variant="secondary" onPress={() => queue.refetch()}>Coba lagi</Button>
        </Alert>
      ) : null}
      {!queue.isLoading && !queue.isError && selectedClassId && attempts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/10">
          <ClipboardCheck size={24} className="text-teal-600" />
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">Semua esai sudah dinilai</p>
            <p className="mt-1 text-sm text-slate-500">Tidak ada attempt terkunci yang menunggu penilaian.</p>
          </div>
        </div>
      ) : null}

      {attempts.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {attempts.map((attempt) => (
            <Card key={attempt.id} className="items-stretch">
              <Card.Header>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Card.Title>{attempt.student.name}</Card.Title>
                    <Card.Description>{attempt.challenge.title}</Card.Description>
                  </div>
                  <Chip size="sm" color="warning" variant="soft">Pending</Chip>
                </div>
              </Card.Header>
              <Card.Content className="flex flex-col gap-2 text-sm">
                <p className="text-slate-600 dark:text-slate-300">
                  {attempt.gradedEssayAnswersCount} dari {attempt.essayAnswersCount} esai sudah dinilai
                </p>
                {attempt.finishedAt ? (
                  <p className="text-xs text-slate-500">
                    Dikumpulkan {new Intl.DateTimeFormat("id-ID", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Jakarta",
                    }).format(new Date(attempt.finishedAt))}
                  </p>
                ) : null}
              </Card.Content>
              <Card.Footer className="mt-auto">
                <Button
                  fullWidth
                  onPress={() => router.push(`/dosen/grading/attempts/${attempt.id}?classId=${selectedClassId}`)}
                >
                  Buka penilaian <ArrowRight size={16} />
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      ) : null}

      {queue.hasNextPage ? (
        <Button
          variant="secondary"
          isPending={queue.isFetchingNextPage}
          isDisabled={queue.isFetchingNextPage}
          onPress={() => queue.fetchNextPage()}
        >
          Muat antrean berikutnya
        </Button>
      ) : null}
    </div>
  );
}
