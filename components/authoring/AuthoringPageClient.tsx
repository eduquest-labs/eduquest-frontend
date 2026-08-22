"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Plus } from "lucide-react";
import { Alert, Button, Modal, Skeleton, toast, useOverlayState } from "@heroui/react";

import { useCreateTerm, useCreateTopic } from "@/hooks/mutations";
import { useClasses, useTerms, useTopics } from "@/hooks/queries";
import { TermForm } from "@/components/term";
import { TermSection } from "@/components/authoring/TermSection";
import { TopicForm } from "@/components/authoring/TopicForm";
import { TopicSection } from "@/components/authoring/TopicSection";
import type { Topic } from "@/types";

const LAST_CLASS_KEY = "eduquest:authoring:last-class";

export interface AuthoringPageClientProps {
  initialClassId: number | null;
}

export function AuthoringPageClient({ initialClassId }: AuthoringPageClientProps) {
  const router = useRouter();
  const classes = useClasses();
  const classId = initialClassId;
  const validClassIds = useMemo(() => new Set(classes.data?.map((item) => item.id) ?? []), [classes.data]);
  const selectedClassId = classId !== null && validClassIds.has(classId) ? classId : null;
  const topics = useTopics(selectedClassId ?? 0, selectedClassId !== null);
  const terms = useTerms(selectedClassId ?? 0, selectedClassId !== null);
  const createTopicOverlay = useOverlayState();
  const createTermOverlay = useOverlayState();
  const createTopic = useCreateTopic(selectedClassId ?? 0);
  const createTerm = useCreateTerm(selectedClassId ?? 0);

  const topicsByTermId = useMemo(() => {
    const grouped = new Map<number | null, Topic[]>();
    for (const topic of topics.data ?? []) {
      const key = topic.termId;
      grouped.set(key, [...(grouped.get(key) ?? []), topic]);
    }
    return grouped;
  }, [topics.data]);
  const ungroupedTopics = topicsByTermId.get(null) ?? [];

  useEffect(() => {
    if (!classes.data?.length) return;
    if (classId !== null && validClassIds.has(classId)) {
      sessionStorage.setItem(LAST_CLASS_KEY, String(classId));
      return;
    }
    const remembered = Number(sessionStorage.getItem(LAST_CLASS_KEY));
    const nextId = validClassIds.has(remembered) ? remembered : classes.data[0].id;
    router.replace(`/guru/authoring?classId=${nextId}`);
  }, [classId, classes.data, router, validClassIds]);

  function selectClass(nextClassId: number) {
    sessionStorage.setItem(LAST_CLASS_KEY, String(nextClassId));
    router.replace(`/guru/authoring?classId=${nextClassId}`);
  }

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Authoring</h1>
          <p className="mt-1 text-sm text-slate-500">Susun termin, topic, challenge, dan soal dalam konteks kelas yang jelas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" isDisabled={!selectedClassId} onPress={createTermOverlay.open}><Plus size={16} /> Tambah termin</Button>
          <Button className="bg-teal-600 text-white hover:bg-teal-700" isDisabled={!selectedClassId} onPress={createTopicOverlay.open}><Plus size={16} /> Tambah topic</Button>
        </div>
      </div>

      {classes.isLoading ? <Skeleton className="h-20 w-full rounded-xl" /> : null}
      {classes.isError ? <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Daftar kelas gagal dimuat.</Alert.Description></Alert.Content></Alert> : null}
      {classes.data?.length === 0 ? (
        <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Description>Buat kelas terlebih dahulu sebelum menyusun authoring.</Alert.Description></Alert.Content></Alert>
      ) : null}
      {classes.data?.length ? (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <label className="flex max-w-md flex-col gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200">
            Kelas aktif
            <select value={selectedClassId ?? ""} onChange={(event) => selectClass(Number(event.target.value))} className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm dark:border-white/15 dark:bg-black">
              {classes.data.map((kelas) => <option key={kelas.id} value={kelas.id}>{kelas.name}</option>)}
            </select>
          </label>
        </div>
      ) : null}

      {topics.isLoading ? <div className="flex flex-col gap-3">{[1,2,3].map((item) => <Skeleton key={item} className="h-20 w-full rounded-xl" />)}</div> : null}
      {topics.isError ? <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Topic kelas gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => topics.refetch()}>Coba lagi</Button></Alert> : null}
      {!topics.isLoading && !topics.isError && selectedClassId && topics.data?.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/10"><BookOpen size={22} className="text-slate-300" /><div><p className="font-semibold text-slate-900 dark:text-white">Belum ada topic</p><p className="mt-1 text-sm text-slate-500">Buat topic pertama untuk mulai menyusun challenge.</p></div></div>
      ) : null}

      {selectedClassId && terms.data?.length ? (
        <div className="flex flex-col gap-3">
          {terms.data.map((term) => (
            <TermSection key={term.id} classId={selectedClassId} term={term} topics={topicsByTermId.get(term.id) ?? []} classes={classes.data ?? []} />
          ))}
        </div>
      ) : null}

      {selectedClassId && ungroupedTopics.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-500">Topic tanpa termin</h2>
          {ungroupedTopics.map((topic) => <TopicSection key={topic.id} classId={selectedClassId} topic={topic} classes={classes.data ?? []} />)}
        </div>
      ) : null}

      <Modal.Backdrop isOpen={createTopicOverlay.isOpen} onOpenChange={createTopicOverlay.setOpen}><Modal.Container><Modal.Dialog className="sm:max-w-110"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Tambah topic</Modal.Heading></Modal.Header><Modal.Body><TopicForm classId={selectedClassId ?? 0} isPending={createTopic.isPending} onSubmit={async (input) => { await createTopic.mutateAsync(input); createTopicOverlay.close(); toast.success("Topic berhasil dibuat."); }} /></Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>

      <Modal.Backdrop isOpen={createTermOverlay.isOpen} onOpenChange={createTermOverlay.setOpen}><Modal.Container><Modal.Dialog className="sm:max-w-110"><Modal.CloseTrigger /><Modal.Header><Modal.Heading>Tambah termin</Modal.Heading></Modal.Header><Modal.Body><TermForm isPending={createTerm.isPending} onSubmit={async (input) => { await createTerm.mutateAsync(input); createTermOverlay.close(); toast.success("Termin berhasil dibuat."); }} /></Modal.Body></Modal.Dialog></Modal.Container></Modal.Backdrop>
    </div>
  );
}
