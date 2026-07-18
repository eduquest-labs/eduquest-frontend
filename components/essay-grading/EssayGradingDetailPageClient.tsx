"use client";

import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { Alert, Button, Card, Chip, Skeleton, toast } from "@heroui/react";

import { EssayGradeForm } from "@/components/essay-grading/EssayGradeForm";
import { useDownloadAnswerAttachment } from "@/hooks/mutations";
import { useAttemptDetail } from "@/hooks/queries";

interface EssayGradingDetailPageClientProps {
  attemptId: number;
  classId: number;
}

export function EssayGradingDetailPageClient({
  attemptId,
  classId,
}: EssayGradingDetailPageClientProps) {
  const attempt = useAttemptDetail(attemptId);
  const downloadAttachment = useDownloadAnswerAttachment();

  async function handleDownload(answerId: number) {
    try {
      const file = await downloadAttachment.mutateAsync(answerId);
      const url = URL.createObjectURL(file.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.danger("Lampiran gagal diunduh.");
    }
  }

  if (attempt.isLoading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-8">
        <Skeleton className="h-10 w-2/3 rounded-lg" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (attempt.isError || !attempt.data) {
    return (
      <div className="p-4 sm:p-8">
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content><Alert.Description>Detail attempt gagal dimuat.</Alert.Description></Alert.Content>
        </Alert>
      </div>
    );
  }

  const essayQuestions = attempt.data.questions.filter((question) => question.questionType === "esai");

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3">
        <Link
          href={classId > 0 ? `/dosen/grading?classId=${classId}` : "/dosen/grading"}
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"
        >
          <ArrowLeft size={15} /> Kembali ke antrean
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
              {attempt.data.student.name}
            </h1>
            <p className="mt-1 text-sm text-slate-500">{attempt.data.challenge.title}</p>
          </div>
          <Chip
            color={attempt.data.gradingStatus === "complete" ? "success" : "warning"}
            variant="soft"
          >
            {attempt.data.gradingStatus === "complete" ? "Complete" : "Pending"}
          </Chip>
        </div>
      </div>

      {attempt.data.gradingStatus === "complete" ? (
        <Alert status="success">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Penilaian selesai</Alert.Title>
            <Alert.Description>Nilai akhir attempt: {attempt.data.totalScore} poin.</Alert.Description>
          </Alert.Content>
        </Alert>
      ) : (
        <Alert status="warning">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Nilai akhir masih ditahan</Alert.Title>
            <Alert.Description>Nilai akan tampil kepada siswa setelah seluruh jawaban esai dinilai.</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {essayQuestions.length === 0 ? (
        <Alert>
          <Alert.Indicator />
          <Alert.Content><Alert.Description>Attempt ini tidak memiliki soal esai.</Alert.Description></Alert.Content>
        </Alert>
      ) : null}

      {essayQuestions.map((question, index) => {
        const answer = attempt.data.answers.find((item) => item.questionId === question.id);

        return (
          <Card key={question.id} className="items-stretch">
            <Card.Header>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Card.Title>Esai {index + 1}</Card.Title>
                  <Card.Description>{question.questionText}</Card.Description>
                </div>
                <Chip size="sm">{question.points} poin</Chip>
              </div>
            </Card.Header>
            <Card.Content className="flex flex-col gap-5">
              {answer ? (
                <>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Jawaban siswa</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-900 dark:text-white">
                      {answer.answerText || "Jawaban hanya berupa lampiran."}
                    </p>
                    {answer.hasAttachment ? (
                      <Button
                        className="mt-3"
                        size="sm"
                        variant="secondary"
                        isPending={downloadAttachment.isPending}
                        onPress={() => handleDownload(answer.id)}
                      >
                        <Download size={15} /> Unduh lampiran
                      </Button>
                    ) : null}
                  </div>
                  <EssayGradeForm
                    classId={classId}
                    attemptId={attemptId}
                    question={question}
                    answer={answer}
                  />
                </>
              ) : (
                <Alert status="warning">
                  <Alert.Indicator />
                  <Alert.Content><Alert.Description>Siswa tidak menjawab soal esai ini.</Alert.Description></Alert.Content>
                </Alert>
              )}
            </Card.Content>
          </Card>
        );
      })}
    </div>
  );
}
