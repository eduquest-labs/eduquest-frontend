"use client";

import { useState } from "react";
import { isAxiosError } from "axios";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, Button, Modal, toast, useOverlayState } from "@heroui/react";

import { useDeleteTopic, useUpdateTopic } from "@/hooks/mutations";
import { ChallengeList } from "@/components/authoring/ChallengeList";
import { TopicForm } from "@/components/authoring/TopicForm";
import { cn } from "@/lib/utils";
import type { KelasClass, Topic } from "@/types";

export interface TopicSectionProps {
  classId: number;
  topic: Topic;
  classes: KelasClass[];
}

export function TopicSection({ classId, topic, classes }: TopicSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const editOverlay = useOverlayState();
  const updateTopic = useUpdateTopic(classId);
  const deleteTopic = useDeleteTopic(classId);

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/5">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <button type="button" onClick={() => setExpanded((value) => !value)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
          <ChevronDown size={18} className={cn("shrink-0 text-slate-400 transition-transform", expanded && "rotate-180")} />
          <div className="min-w-0">
            <h2 className="truncate font-semibold text-slate-900 dark:text-white">{topic.name}</h2>
            <p className="text-xs text-slate-500">Urutan {topic.sortOrder}</p>
          </div>
        </button>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="tertiary" onPress={editOverlay.open}><Pencil size={15} /> Edit</Button>
          <Button size="sm" variant="tertiary" className="text-danger" onPress={() => setConfirmDelete(true)}><Trash2 size={15} /> Hapus</Button>
        </div>
      </div>
      <ChallengeList classId={classId} topic={topic} classes={classes} enabled={expanded} />

      <Modal.Backdrop isOpen={editOverlay.isOpen} onOpenChange={editOverlay.setOpen}>
        <Modal.Container><Modal.Dialog className="sm:max-w-110"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Edit topic</Modal.Heading></Modal.Header><Modal.Body><TopicForm topic={topic} isPending={updateTopic.isPending} onSubmit={async (input) => { await updateTopic.mutateAsync({ topicId: topic.id, input }); editOverlay.close(); toast.success("Topic berhasil diperbarui."); }} /></Modal.Body></Modal.Dialog></Modal.Container>
      </Modal.Backdrop>

      <AlertDialog.Backdrop isOpen={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialog.Container><AlertDialog.Dialog className="sm:max-w-110"><AlertDialog.CloseTrigger /><AlertDialog.Header><AlertDialog.Icon status="danger" /><AlertDialog.Heading>Hapus topic?</AlertDialog.Heading></AlertDialog.Header><AlertDialog.Body><p className="text-sm text-slate-500">Topic hanya dapat dihapus jika belum pernah memiliki challenge.</p></AlertDialog.Body><AlertDialog.Footer><Button slot="close" variant="tertiary">Batal</Button><Button variant="danger" isPending={deleteTopic.isPending} onPress={async () => { try { await deleteTopic.mutateAsync(topic.id); setConfirmDelete(false); toast.success("Topic berhasil dihapus."); } catch (error) { toast.danger(isAxiosError(error) && error.response?.status === 409 ? error.response.data?.message : "Topic gagal dihapus."); } }}>Hapus</Button></AlertDialog.Footer></AlertDialog.Dialog></AlertDialog.Container>
      </AlertDialog.Backdrop>
    </section>
  );
}
