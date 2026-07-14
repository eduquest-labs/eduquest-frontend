"use client";

import { useState } from "react";
import Link from "next/link";
import { isAxiosError } from "axios";
import { Clock, Pencil, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDialog, Button, Modal, Skeleton, toast, useOverlayState } from "@heroui/react";

import {
  useCreateChallenge,
  useDeleteChallenge,
  useSetChallengePublished,
  useUpdateChallenge,
} from "@/hooks/mutations";
import { useChallenges, useQuestions } from "@/hooks/queries";
import { ChallengeForm } from "@/components/authoring/ChallengeForm";
import { DuplicateChallengeDialog } from "@/components/authoring/DuplicateChallengeDialog";
import {
  CHALLENGE_AVAILABILITY_CLASS_NAMES,
  CHALLENGE_AVAILABILITY_LABELS,
} from "@/lib/challenge-availability";
import { BUSINESS_TIME_LABEL, BUSINESS_TIME_ZONE } from "@/lib/business-time";
import type { Challenge, KelasClass, Topic } from "@/types";

export interface ChallengeListProps {
  classId: number;
  topic: Topic;
  classes: KelasClass[];
  enabled: boolean;
}

function formatSchedule(challenge: Challenge): string {
  if (!challenge.startTime && !challenge.endTime) return `Tanpa jadwal (${BUSINESS_TIME_LABEL})`;
  const formatter = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: BUSINESS_TIME_ZONE,
  });
  const start = challenge.startTime ? formatter.format(new Date(challenge.startTime)) : "sekarang";
  const end = challenge.endTime ? formatter.format(new Date(challenge.endTime)) : "tanpa batas";
  return `${start} – ${end} ${BUSINESS_TIME_LABEL}`;
}

function PublishControl({ challenge, topicId }: { challenge: Challenge; topicId: number }) {
  const overlay = useOverlayState();
  const questions = useQuestions(challenge.id, overlay.isOpen && !challenge.isPublished);
  const setPublished = useSetChallengePublished(topicId);
  const questionCount = questions.data?.length ?? 0;

  async function confirm() {
    try {
      await setPublished.mutateAsync({ challengeId: challenge.id, published: !challenge.isPublished });
      overlay.close();
      toast.success(challenge.isPublished ? "Challenge dikembalikan ke draft." : "Challenge berhasil dipublikasikan.");
    } catch {
      toast.danger("Status challenge gagal diubah.");
    }
  }

  return (
    <>
      <Button size="sm" variant={challenge.isPublished ? "secondary" : "primary"} onPress={overlay.open}>
        {challenge.isPublished ? "Unpublish" : "Publish"}
      </Button>
      <AlertDialog.Backdrop isOpen={overlay.isOpen} onOpenChange={overlay.setOpen}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-110">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status={challenge.isPublished ? "warning" : "success"} />
              <AlertDialog.Heading>{challenge.isPublished ? "Kembalikan ke draft?" : "Publikasikan challenge?"}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              {challenge.isPublished ? (
                <p className="text-sm text-slate-500">Unpublish belum dapat mendeteksi apakah sudah ada submission. Pastikan pengumpulan data belum dimulai.</p>
              ) : questions.isLoading ? (
                <Skeleton className="h-10 w-full rounded-lg" />
              ) : questions.isError ? (
                <p className="text-sm text-danger">Daftar soal gagal diperiksa.</p>
              ) : questionCount === 0 ? (
                <p className="text-sm text-danger">Tambahkan minimal satu soal sebelum publish.</p>
              ) : (
                <p className="text-sm text-slate-500">{questionCount} soal akan dipublikasikan. Tipe dan opsi jawabannya akan dikunci.</p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">Batal</Button>
              <Button
                variant={challenge.isPublished ? "danger" : "primary"}
                isPending={setPublished.isPending}
                isDisabled={!challenge.isPublished && (questions.isLoading || questions.isError || questionCount === 0)}
                onPress={confirm}
              >Konfirmasi</Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </>
  );
}

export function ChallengeList({ classId, topic, classes, enabled }: ChallengeListProps) {
  const challenges = useChallenges(topic.id, enabled);
  const createOverlay = useOverlayState();
  const editOverlay = useOverlayState();
  const createMutation = useCreateChallenge(topic.id);
  const updateMutation = useUpdateChallenge(topic.id);
  const deleteMutation = useDeleteChallenge(topic.id);
  const [editing, setEditing] = useState<Challenge | null>(null);
  const [deleting, setDeleting] = useState<Challenge | null>(null);

  if (!enabled) return null;
  if (challenges.isLoading) return <div className="flex flex-col gap-2 p-4">{[1,2].map((item) => <Skeleton key={item} className="h-24 w-full rounded-xl" />)}</div>;
  if (challenges.isError) return <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Challenge gagal dimuat.</Alert.Description></Alert.Content></Alert>;

  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 p-4 dark:border-white/10">
      <div className="flex justify-end"><Button size="sm" variant="secondary" onPress={createOverlay.open}><Plus size={15} /> Tambah challenge</Button></div>
      {!challenges.data?.length ? (
        <p className="rounded-lg border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-white/10">Belum ada challenge dalam topic ini.</p>
      ) : challenges.data.map((challenge) => (
        <article key={challenge.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-slate-900 dark:text-white">{challenge.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CHALLENGE_AVAILABILITY_CLASS_NAMES[challenge.availabilityStatus]}`}>{CHALLENGE_AVAILABILITY_LABELS[challenge.availabilityStatus]}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{challenge.description || "Tanpa deskripsi"}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500"><Clock size={13} /> {formatSchedule(challenge)} · {challenge.type === "kuis" ? "Kuis" : "Aktivitas fisik"} · {challenge.pointsReward} poin</p>
            </div>
            <PublishControl challenge={challenge} topicId={topic.id} />
          </div>
          <div className="flex flex-wrap gap-1 border-t border-slate-200 pt-3 dark:border-white/10">
            <Link href={`/dosen/authoring/classes/${classId}/topics/${topic.id}/challenges/${challenge.id}`} className="inline-flex h-8 items-center rounded-lg bg-slate-100 px-3 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15">Kelola soal</Link>
            <Button size="sm" variant="tertiary" onPress={() => { setEditing(challenge); editOverlay.open(); }}><Pencil size={15} /> Edit</Button>
            <DuplicateChallengeDialog challenge={challenge} sourceClassId={classId} classes={classes} />
            <Button size="sm" variant="tertiary" className="text-danger" onPress={() => setDeleting(challenge)}><Trash2 size={15} /> Hapus</Button>
          </div>
        </article>
      ))}

      <Modal.Backdrop isOpen={createOverlay.isOpen} onOpenChange={createOverlay.setOpen}><Modal.Container size="lg"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Tambah challenge</Modal.Heading></Modal.Header><Modal.Body><ChallengeForm isPending={createMutation.isPending} onSubmit={async (input) => { await createMutation.mutateAsync(input); createOverlay.close(); toast.success("Challenge berhasil dibuat sebagai draft."); }} /></Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <Modal.Backdrop isOpen={editOverlay.isOpen} onOpenChange={(open) => { editOverlay.setOpen(open); if (!open) setEditing(null); }}><Modal.Container size="lg"><Modal.Dialog><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Edit challenge</Modal.Heading></Modal.Header><Modal.Body>{editing ? <ChallengeForm challenge={editing} isPending={updateMutation.isPending} onSubmit={async (input) => { await updateMutation.mutateAsync({ challengeId: editing.id, input }); editOverlay.close(); setEditing(null); toast.success("Challenge berhasil diperbarui."); }} /> : null}</Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>
      <AlertDialog.Backdrop isOpen={deleting !== null} onOpenChange={(open) => { if (!open) setDeleting(null); }}><AlertDialog.Container><AlertDialog.Dialog className="sm:max-w-105"><AlertDialog.CloseTrigger /><AlertDialog.Header><AlertDialog.Icon status="danger" /><AlertDialog.Heading>Hapus challenge?</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p className="text-sm text-slate-500">Challenge akan dihapus dari tampilan, tetapi tetap dipertahankan sebagai data soft-delete.</p></AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Batal</Button><Button variant="danger" isPending={deleteMutation.isPending} onPress={async () => { if (!deleting) return; try { await deleteMutation.mutateAsync(deleting.id); setDeleting(null); toast.success("Challenge berhasil dihapus."); } catch (error) { toast.danger(isAxiosError(error) && error.response?.status === 409 ? error.response.data?.message : "Challenge gagal dihapus."); } }}>Hapus</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container></AlertDialog.Backdrop>
    </div>
  );
}
