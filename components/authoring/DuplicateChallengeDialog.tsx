"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Alert, Button, Modal, Skeleton, toast, useOverlayState } from "@heroui/react";

import { useDuplicateChallenge } from "@/hooks/mutations";
import { useTopics } from "@/hooks/queries";
import type { Challenge, KelasClass } from "@/types";

export interface DuplicateChallengeDialogProps {
  challenge: Challenge;
  sourceClassId: number;
  classes: KelasClass[];
}

export function DuplicateChallengeDialog({ challenge, sourceClassId, classes }: DuplicateChallengeDialogProps) {
  const router = useRouter();
  const overlay = useOverlayState();
  const [targetClassId, setTargetClassId] = useState(sourceClassId);
  const [targetTopicId, setTargetTopicId] = useState<number | null>(null);
  const topics = useTopics(targetClassId, overlay.isOpen);
  const duplicate = useDuplicateChallenge();

  async function handleDuplicate() {
    if (!targetTopicId) return;
    try {
      const result = await duplicate.mutateAsync({ challengeId: challenge.id, targetTopicId });
      overlay.close();
      toast.success(`Challenge "${challenge.title}" berhasil diduplikasi sebagai draft.`, {
        actionProps: {
          children: "Buka salinan",
          onPress: () => router.push(
            `/dosen/authoring/classes/${targetClassId}/topics/${targetTopicId}/challenges/${result.id}`
          ),
        },
      });
    } catch {
      toast.danger("Challenge gagal diduplikasi.");
    }
  }

  return (
    <>
      <Button size="sm" variant="tertiary" onPress={overlay.open} aria-label={`Duplikasi ${challenge.title}`}>
        <Copy size={15} /> Duplikasi
      </Button>
      <Modal.Backdrop isOpen={overlay.isOpen} onOpenChange={overlay.setOpen}>
        <Modal.Container>
          <Modal.Dialog className="sm:max-w-120">
            <Modal.CloseTrigger />
            <Modal.Header><Modal.Heading>Duplikasi challenge</Modal.Heading></Modal.Header>
            <Modal.Body className="flex flex-col gap-4">
              <Alert status="warning">
                <Alert.Indicator />
                <Alert.Content><Alert.Description>Salinan selalu dibuat sebagai draft dan perlu ditinjau sebelum dipublikasikan.</Alert.Description></Alert.Content>
              </Alert>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Kelas tujuan
                <select
                  value={targetClassId}
                  onChange={(event) => {
                    setTargetClassId(Number(event.target.value));
                    setTargetTopicId(null);
                  }}
                  className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-black"
                >
                  {classes.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.name}</option>)}
                </select>
              </label>
              {topics.isLoading ? <Skeleton className="h-10 w-full rounded-lg" /> : null}
              {topics.isError ? (
                <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Topic tujuan gagal dimuat.</Alert.Description></Alert.Content></Alert>
              ) : null}
              {!topics.isLoading && !topics.isError ? (
                <label className="flex flex-col gap-1.5 text-sm font-medium">
                  Topic tujuan
                  <select
                    value={targetTopicId ?? ""}
                    onChange={(event) => setTargetTopicId(event.target.value ? Number(event.target.value) : null)}
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-black"
                  >
                    <option value="">Pilih topic</option>
                    {topics.data?.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                  </select>
                  {topics.data?.length === 0 ? <span className="text-xs text-slate-500">Kelas ini belum memiliki topic.</span> : null}
                </label>
              ) : null}
            </Modal.Body>
            <Modal.Footer>
              <Button slot="close" variant="tertiary">Batal</Button>
              <Button
                className="bg-teal-600 text-white"
                isPending={duplicate.isPending}
                isDisabled={!targetTopicId || duplicate.isPending}
                onPress={handleDuplicate}
              >Duplikasi sebagai draft</Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
