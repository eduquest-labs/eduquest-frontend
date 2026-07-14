"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDialog, Button, Modal, Skeleton, toast, useOverlayState } from "@heroui/react";

import {
  useCreateQuestion,
  useDeleteQuestion,
  useSetChallengePublished,
  useUpdateChallenge,
  useUpdateQuestion,
} from "@/hooks/mutations";
import { useChallenges, useClass, useQuestions, useTopics } from "@/hooks/queries";
import { ChallengeForm } from "@/components/authoring/ChallengeForm";
import { QuestionForm } from "@/components/authoring/QuestionForm";
import {
  CHALLENGE_AVAILABILITY_CLASS_NAMES,
  CHALLENGE_AVAILABILITY_LABELS,
} from "@/lib/challenge-availability";
import type { Question, QuestionInput } from "@/types";

export interface ChallengeEditorPageClientProps {
  classId: number;
  topicId: number;
  challengeId: number;
}

const QUESTION_TYPE_LABELS = {
  pilihan_ganda: "Pilihan ganda",
  isian_singkat: "Isian singkat",
  esai: "Esai",
} as const;

export function ChallengeEditorPageClient({ classId, topicId, challengeId }: ChallengeEditorPageClientProps) {
  const kelas = useClass(classId);
  const topics = useTopics(classId);
  const challenges = useChallenges(topicId);
  const questions = useQuestions(challengeId);
  const topic = topics.data?.find((item) => item.id === topicId);
  const challenge = challenges.data?.find((item) => item.id === challengeId);

  const createOverlay = useOverlayState();
  const editQuestionOverlay = useOverlayState();
  const editChallengeOverlay = useOverlayState();
  const stateOverlay = useOverlayState();
  const createQuestion = useCreateQuestion(challengeId);
  const updateQuestion = useUpdateQuestion(challengeId);
  const deleteQuestion = useDeleteQuestion(challengeId);
  const updateChallenge = useUpdateChallenge(topicId);
  const setPublished = useSetChallengePublished(topicId);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);

  const loading = kelas.isLoading || topics.isLoading || challenges.isLoading || questions.isLoading;
  const failed = kelas.isError || topics.isError || challenges.isError || questions.isError;

  if (loading) {
    return <div className="flex flex-col gap-4 p-4 sm:p-8"><Skeleton className="h-8 w-2/3 rounded-lg" /><Skeleton className="h-32 w-full rounded-xl" /><Skeleton className="h-48 w-full rounded-xl" /></div>;
  }
  if (failed) {
    return <div className="p-4 sm:p-8"><Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Editor challenge gagal dimuat.</Alert.Description></Alert.Content></Alert></div>;
  }
  if (!kelas.data || !topic || !challenge || topic.classId !== classId || challenge.topicId !== topicId) {
    return <div className="p-4 sm:p-8"><Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Challenge tidak ditemukan dalam konteks kelas dan topic ini.</Alert.Description></Alert.Content></Alert></div>;
  }

  const isPublished = challenge.isPublished;

  async function saveQuestion(input: QuestionInput) {
    if (!editingQuestion) return;
    await updateQuestion.mutateAsync({
      questionId: editingQuestion.id,
      input: isPublished
        ? {
            questionText: input.questionText,
            points: input.points,
            correctAnswerText: input.correctAnswerText,
          }
        : input,
    });
    editQuestionOverlay.close();
    setEditingQuestion(null);
    toast.success(isPublished ? "Koreksi soal disimpan dan dicatat dalam audit." : "Soal berhasil diperbarui.");
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-col gap-3">
        <Link href={`/dosen/authoring?classId=${classId}`} className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 dark:text-teal-300"><ArrowLeft size={15} /> Kembali ke Authoring</Link>
        <div className="text-xs text-slate-500">{kelas.data.name} / {topic.name}</div>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{challenge.title}</h1>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CHALLENGE_AVAILABILITY_CLASS_NAMES[challenge.availabilityStatus]}`}>{CHALLENGE_AVAILABILITY_LABELS[challenge.availabilityStatus]}</span>
            </div>
            <p className="mt-1 text-sm text-slate-500">{challenge.description || "Tanpa deskripsi"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onPress={editChallengeOverlay.open}><Pencil size={15} /> Edit metadata</Button>
            <Button variant={isPublished ? "danger" : "primary"} onPress={stateOverlay.open}>{isPublished ? "Unpublish" : "Publish"}</Button>
          </div>
        </div>
      </div>

      {isPublished ? (
        <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Title>Instrumen sudah dipublikasikan</Alert.Title><Alert.Description>Tipe, opsi, urutan, dan batas waktu soal dikunci. Koreksi isi, jawaban benar, atau poin akan dicatat sebagai revision.</Alert.Description></Alert.Content></Alert>
      ) : null}

      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-semibold text-slate-900 dark:text-white">Daftar soal</h2><p className="text-sm text-slate-500">{questions.data?.length ?? 0} soal</p></div>
          {!isPublished ? <Button className="bg-teal-600 text-white" onPress={createOverlay.open}><Plus size={16} /> Tambah soal</Button> : null}
        </div>
        {!questions.data?.length ? (
          <div className="rounded-lg border border-dashed border-slate-200 px-6 py-12 text-center dark:border-white/10"><p className="font-medium text-slate-900 dark:text-white">Belum ada soal</p><p className="mt-1 text-sm text-slate-500">Tambahkan minimal satu soal sebelum challenge dipublikasikan.</p></div>
        ) : questions.data.map((question, index) => (
          <article key={question.id} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500"><span>Soal {index + 1}</span><span>·</span><span>{QUESTION_TYPE_LABELS[question.questionType]}</span><span>·</span><span>{question.points} poin</span></div>
                <p className="mt-2 whitespace-pre-wrap text-sm font-medium text-slate-900 dark:text-white">{question.questionText}</p>
                {question.questionType === "pilihan_ganda" ? <ul className="mt-3 grid gap-2 sm:grid-cols-2">{question.options.map((option) => <li key={option.id} className={option.isCorrect ? "flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700 dark:bg-teal-400/10 dark:text-teal-300" : "rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:bg-white/5 dark:text-slate-300"}>{option.isCorrect ? <CheckCircle2 size={14} /> : null}{option.optionText}</li>)}</ul> : null}
                {question.questionType === "isian_singkat" ? <p className="mt-3 text-sm text-teal-700 dark:text-teal-300">Jawaban: {question.correctAnswerText}</p> : null}
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="tertiary" onPress={() => { setEditingQuestion(question); editQuestionOverlay.open(); }}><Pencil size={15} /> Edit</Button>
                {!isPublished ? <Button size="sm" variant="tertiary" className="text-danger" onPress={() => setDeletingQuestion(question)}><Trash2 size={15} /></Button> : null}
              </div>
            </div>
          </article>
        ))}
      </section>

      <Modal.Backdrop isOpen={createOverlay.isOpen} onOpenChange={createOverlay.setOpen}><Modal.Container size="cover" scroll="inside"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Tambah soal</Modal.Heading></Modal.Header><Modal.Body><QuestionForm formId="create-question-form" hideSubmitButton isPublished={false} isPending={createQuestion.isPending} onSubmit={async (input) => { await createQuestion.mutateAsync(input); createOverlay.close(); toast.success("Soal berhasil ditambahkan."); }} /></Modal.Body><Modal.Footer><Button type="submit" form="create-question-form" isPending={createQuestion.isPending} isDisabled={createQuestion.isPending} className="bg-teal-600 text-white hover:bg-teal-700">Tambah soal</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <Modal.Backdrop isOpen={editQuestionOverlay.isOpen} onOpenChange={(open) => { editQuestionOverlay.setOpen(open); if (!open) setEditingQuestion(null); }}><Modal.Container size="cover" scroll="inside"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>{isPublished ? "Koreksi soal published" : "Edit soal"}</Modal.Heading></Modal.Header><Modal.Body>{editingQuestion ? <QuestionForm formId="edit-question-form" hideSubmitButton question={editingQuestion} isPublished={isPublished} isPending={updateQuestion.isPending} onSubmit={saveQuestion} /> : null}</Modal.Body><Modal.Footer><Button type="submit" form="edit-question-form" isPending={updateQuestion.isPending} isDisabled={updateQuestion.isPending} className="bg-teal-600 text-white hover:bg-teal-700">Simpan perubahan</Button></Modal.Footer></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <Modal.Backdrop isOpen={editChallengeOverlay.isOpen} onOpenChange={editChallengeOverlay.setOpen}><Modal.Container size="lg"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Edit metadata challenge</Modal.Heading></Modal.Header><Modal.Body><ChallengeForm challenge={challenge} isPending={updateChallenge.isPending} onSubmit={async (input) => { await updateChallenge.mutateAsync({ challengeId, input }); editChallengeOverlay.close(); toast.success("Metadata challenge diperbarui."); }} /></Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>

      <AlertDialog.Backdrop isOpen={stateOverlay.isOpen} onOpenChange={stateOverlay.setOpen}><AlertDialog.Container><AlertDialog.Dialog className="sm:max-w-110"><AlertDialog.CloseTrigger /><AlertDialog.Header><AlertDialog.Icon status={isPublished ? "warning" : "success"} /><AlertDialog.Heading>{isPublished ? "Kembalikan ke draft?" : "Publikasikan challenge?"}</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p className="text-sm text-slate-500">{isPublished ? "Pastikan belum ada pengumpulan data. Sistem belum memiliki attempt-aware locking." : questions.data?.length ? `${questions.data.length} soal akan dipublikasikan dan struktur jawabannya dikunci.` : "Tambahkan minimal satu soal sebelum publish."}</p></AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Batal</Button><Button variant={isPublished ? "danger" : "primary"} isDisabled={!isPublished && !questions.data?.length} isPending={setPublished.isPending} onPress={async () => { try { await setPublished.mutateAsync({ challengeId, published: !isPublished }); stateOverlay.close(); toast.success(isPublished ? "Challenge dikembalikan ke draft." : "Challenge dipublikasikan."); } catch { toast.danger("Status challenge gagal diubah."); } }}>Konfirmasi</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>

      <AlertDialog.Backdrop isOpen={deletingQuestion !== null} onOpenChange={(open) => { if (!open) setDeletingQuestion(null); }}><AlertDialog.Container><AlertDialog.Dialog className="sm:max-w-105"><AlertDialog.CloseTrigger /><AlertDialog.Header><AlertDialog.Icon status="danger" /><AlertDialog.Heading>Hapus soal?</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p className="text-sm text-slate-500">Soal akan di-soft-delete dan tidak lagi tampil dalam challenge.</p></AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Batal</Button><Button variant="danger" isPending={deleteQuestion.isPending} onPress={async () => { if (!deletingQuestion) return; try { await deleteQuestion.mutateAsync(deletingQuestion.id); setDeletingQuestion(null); toast.success("Soal berhasil dihapus."); } catch { toast.danger("Soal gagal dihapus."); } }}>Hapus</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
    </div>
  );
}
