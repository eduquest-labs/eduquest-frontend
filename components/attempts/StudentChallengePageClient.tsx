"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Play, Trophy, Users } from "lucide-react";
import { Alert, Button, Skeleton, toast } from "@heroui/react";

import { useOpenChallenge } from "@/hooks/mutations";
import { useMyTerms, useStudentChallenges } from "@/hooks/queries";
import { StudentLeaderboardProgress } from "@/components/leaderboard";
import { StudentGamificationSummary } from "@/components/points-badges";
import { LockedTermBanner } from "@/components/term";

export function StudentChallengePageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challenges = useStudentChallenges();
  const myTerms = useMyTerms();
  const openChallenge = useOpenChallenge();
  const challengeData = challenges.data;
  const groups = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof challengeData>>();
    for (const challenge of challengeData ?? []) {
      const key = `${challenge.classId}:${challenge.topicId}`;
      grouped.set(key, [...(grouped.get(key) ?? []), challenge]);
    }
    return [...grouped.values()];
  }, [challengeData]);

  const sortedTerms = useMemo(
    () => [...(myTerms.data ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
    [myTerms.data]
  );
  const termAccessById = useMemo(() => {
    const access = new Map<number, boolean>();
    let previousPassed = true;
    for (const term of sortedTerms) {
      access.set(term.termId, previousPassed);
      previousPassed = previousPassed && term.status === "passed";
    }
    return access;
  }, [sortedTerms]);

  async function handleOpenChallenge(
    challengeId: number,
    challengeType: "kuis" | "aktivitas_fisik"
  ) {
    if (challengeType === "aktivitas_fisik") {
      router.push(`/siswa/challenges/${challengeId}/physical-activity`);
      return;
    }

    try {
      const { path } = await openChallenge.mutateAsync(challengeId);
      router.push(path);
    } catch {
      toast.danger("Challenge gagal dibuka. Pastikan waktu pengerjaan masih aktif.");
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
        {searchParams.get("claimed") === "1" ? <Alert status="success"><Alert.Indicator /><Alert.Content><Alert.Description>Akun aktif. Cek email untuk verifikasi; kamu tetap bisa langsung belajar.</Alert.Description></Alert.Content></Alert> : null}
        <StudentGamificationSummary />
        <StudentLeaderboardProgress />

        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Challenge aktif</h1>
          <p className="mt-1 text-sm text-slate-500">Pilih challenge untuk mulai atau melanjutkan attempt yang tersimpan.</p>
        </div>

        {challenges.isLoading ? <div className="grid gap-4 sm:grid-cols-2">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-44 rounded-2xl" />)}</div> : null}
        {challenges.isError ? <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Challenge aktif gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => challenges.refetch()}>Coba lagi</Button></Alert> : null}
        {!challenges.isLoading && !challenges.isError && groups.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 px-6 py-16 text-center dark:border-white/10">
            <BookOpen className="text-slate-300" />
            <div><p className="font-semibold text-slate-900 dark:text-white">Belum ada challenge aktif</p><p className="mt-1 text-sm text-slate-500">Challenge akan muncul ketika guru mempublikasikannya sesuai jadwal WIB.</p></div>
          </div>
        ) : null}

        {groups.map((group) => {
          const termId = group[0].termId;
          const isAccessible = termId === null || termAccessById.get(termId) !== false;

          if (!isAccessible) {
            const termIndex = sortedTerms.findIndex((term) => term.termId === termId);
            const currentTerm = sortedTerms[termIndex];
            const previousTerm = termIndex > 0 ? sortedTerms[termIndex - 1] : null;

            return (
              <section key={`${group[0].classId}:${group[0].topicId}`} className="flex flex-col gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{group[0].className}</p><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{group[0].topicName}</h2></div>
                <LockedTermBanner
                  termName={currentTerm?.termName ?? group[0].topicName}
                  previousTermName={previousTerm?.termName ?? null}
                />
              </section>
            );
          }

          return (
          <section key={`${group[0].classId}:${group[0].topicId}`} className="flex flex-col gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{group[0].className}</p><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{group[0].topicName}</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.map((challenge) => (
                <article key={challenge.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">{challenge.title}</h3><p className="mt-1 text-sm text-slate-500">{challenge.description || "Tanpa deskripsi"}</p></div><Trophy className="shrink-0 text-amber-500" size={20} /></div>
                  <p className="text-xs text-slate-500">
                    {challenge.isGroupChallenge
                      ? "Challenge kelompok · dinilai oleh guru"
                      : challenge.type === "aktivitas_fisik"
                        ? "Pelacakan GPS · Rute dan jarak"
                        : `${challenge.pointsReward} poin · ${
                            challenge.timerSeconds
                              ? `${Math.ceil(challenge.timerSeconds / 60)} menit`
                              : "Tanpa timer"
                          }`}
                  </p>
                  {challenge.isGroupChallenge ? (
                    <div className="mt-auto flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                      <Users size={16} className="shrink-0 text-slate-400" />
                      {challenge.groupScore !== null ? (
                        <span className="font-medium text-slate-900 dark:text-white">Skor kelompok: {challenge.groupScore}%</span>
                      ) : (
                        <span className="text-slate-500">Belum dinilai guru</span>
                      )}
                    </div>
                  ) : (
                    <Button
                      isPending={
                        challenge.type === "kuis" &&
                        openChallenge.isPending &&
                        openChallenge.variables === challenge.id
                      }
                      isDisabled={challenge.type === "kuis" && openChallenge.isPending}
                      className="mt-auto bg-teal-600 text-white hover:bg-teal-700"
                      onPress={() => handleOpenChallenge(challenge.id, challenge.type)}
                    >
                      <Play size={16} />
                      {challenge.type === "aktivitas_fisik"
                        ? "Rekam aktivitas"
                        : "Mulai / lanjutkan"}
                    </Button>
                  )}
                </article>
              ))}
            </div>
          </section>
          );
        })}
    </div>
  );
}
