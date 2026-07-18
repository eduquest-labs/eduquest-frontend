"use client";

import Link from "next/link";
import { Alert, Chip, Skeleton } from "@heroui/react";

import { useLatestAttempt } from "@/hooks/queries";

interface AttemptResultPageClientProps {
  challengeId: number;
}

export function AttemptResultPageClient({ challengeId }: AttemptResultPageClientProps) {
  const latest = useLatestAttempt(challengeId);
  const attempt = latest.data;

  if (latest.isLoading) return <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 sm:p-8"><Skeleton className="h-24 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>;
  if (latest.isError) return <div className="p-4 sm:p-8"><Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Hasil attempt gagal dimuat.</Alert.Description></Alert.Content></Alert></div>;
  if (!attempt) return (
    <div className="flex min-h-dvh items-center justify-center p-4"><div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-white/10 dark:bg-white/5"><h1 className="text-xl font-semibold">Belum ada attempt</h1><p className="mt-2 text-sm text-slate-500">Anda belum pernah mengerjakan challenge ini.</p><Link href="/siswa" className="mt-5 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">Kembali ke challenge</Link></div></div>
  );

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-black">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-black/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-slate-900 dark:text-white">{attempt.challenge.title}</p><Link href="/siswa" className="text-xs text-teal-700 hover:underline">Kembali ke daftar</Link></div></div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 sm:p-8">
        <section className="rounded-2xl border border-teal-200 bg-teal-50 p-6 dark:border-teal-400/20 dark:bg-teal-400/5">
          <p className="text-sm font-medium text-teal-700">Attempt selesai dan sudah dikunci</p>
          {attempt.gradingStatus === "complete" ? (
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{attempt.totalScore} poin</p>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Jawaban esai masih menunggu penilaian dosen. Nilai akhir akan muncul setelah penilaian selesai.</p>
          )}
        </section>

        {attempt.questions.map((question, index) => {
          const answer = attempt.answers.find((item) => item.questionId === question.id);
          return (
            <article key={question.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Soal {index + 1}</p><h2 className="mt-1 text-base font-semibold text-slate-900 dark:text-white">{question.questionText}</h2></div>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">{question.points} poin</span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">{answer?.answerText || "Tidak dijawab"}</p>

              {question.questionType === "esai" ? (
                <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-white/10">
                  {answer?.scoreAwarded !== null && answer?.scoreAwarded !== undefined ? (
                    <>
                      <Chip size="sm" color="success" variant="soft" className="w-fit">{answer.scoreAwarded} / {question.points} poin</Chip>
                      {answer.feedback ? <p className="text-sm text-slate-600 dark:text-slate-300">{answer.feedback}</p> : null}
                    </>
                  ) : (
                    <Chip size="sm" color="warning" variant="soft" className="w-fit">Menunggu penilaian</Chip>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </main>
    </div>
  );
}
