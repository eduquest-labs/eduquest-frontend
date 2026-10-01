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
    <div className="flex min-h-dvh items-center justify-center p-4"><div className="max-w-md rounded-2xl border border-border bg-surface p-8 text-center dark:border-border dark:bg-surface-secondary"><h1 className="text-xl font-semibold">Belum ada attempt</h1><p className="mt-2 text-sm text-muted">Anda belum pernah mengerjakan challenge ini.</p><Link href="/siswa" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Kembali ke challenge</Link></div></div>
  );

  return (
    <div className="min-h-dvh bg-background dark:bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur dark:border-border dark:bg-background/90">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-foreground">{attempt.challenge.title}</p><Link href="/siswa" className="text-xs text-brand-700 hover:underline">Kembali ke daftar</Link></div></div>
      </header>
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-5 p-4 sm:p-8">
        <section className="rounded-2xl border border-brand-200 bg-primary-soft p-6 dark:border-brand-400/20 dark:bg-brand-400/5">
          <p className="text-sm font-medium text-brand-700">Attempt selesai dan sudah dikunci</p>
          {attempt.gradingStatus === "complete" ? (
            <p className="mt-2 text-3xl font-bold text-foreground">{attempt.totalScore} poin</p>
          ) : (
            <p className="mt-2 text-sm text-muted">Jawaban esai masih menunggu penilaian guru. Nilai akhir akan muncul setelah penilaian selesai.</p>
          )}
        </section>

        {attempt.questions.map((question, index) => {
          const answer = attempt.answers.find((item) => item.questionId === question.id);
          const selectedOption = question.options.find((option) => option.id === answer?.selectedOptionId);
          const displayedAnswer = question.questionType === "pilihan_ganda"
            ? selectedOption?.optionText
            : answer?.answerText;

          return (
            <article key={question.id} className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6 dark:border-border dark:bg-surface-secondary">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Soal {index + 1}</p><h2 className="mt-1 text-base font-semibold text-foreground">{question.questionText}</h2></div>
                <span className="shrink-0 rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600 dark:bg-surface-secondary dark:text-ink-300">{question.points} poin</span>
              </div>

              <p className="text-sm text-muted">{displayedAnswer || "Tidak dijawab"}</p>

              <div className="mt-4 flex flex-col gap-2 border-t border-ink-100 pt-4 dark:border-border">
                {question.questionType === "esai" ? (
                  answer?.scoreAwarded !== null && answer?.scoreAwarded !== undefined ? (
                    <>
                      <Chip size="sm" color="success" variant="soft" className="w-fit">{answer.scoreAwarded} / {question.points} poin</Chip>
                      {answer.feedback ? <p className="text-sm text-muted">{answer.feedback}</p> : null}
                    </>
                  ) : (
                    <Chip size="sm" color="warning" variant="soft" className="w-fit">Menunggu penilaian</Chip>
                  )
                ) : answer?.scoreAwarded !== null && answer?.scoreAwarded !== undefined ? (
                  <Chip size="sm" color={answer.isCorrect ? "success" : "danger"} variant="soft" className="w-fit">
                    {answer.scoreAwarded} / {question.points} poin
                  </Chip>
                ) : null}
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}
