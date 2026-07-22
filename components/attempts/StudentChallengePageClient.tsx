"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, History, LogOut, Play, Trophy } from "lucide-react";
import { Alert, Button, Skeleton, toast } from "@heroui/react";

import { useLogout, useOpenChallenge } from "@/hooks/mutations";
import { useStudentChallenges } from "@/hooks/queries";
import { StudentLeaderboardProgress } from "@/components/leaderboard";
import { StudentGamificationSummary } from "@/components/points-badges";

export function StudentChallengePageClient() {
  const router = useRouter();
  const challenges = useStudentChallenges();
  const openChallenge = useOpenChallenge();
  const logout = useLogout();
  const challengeData = challenges.data;
  const groups = useMemo(() => {
    const grouped = new Map<string, NonNullable<typeof challengeData>>();
    for (const challenge of challengeData ?? []) {
      const key = `${challenge.classId}:${challenge.topicId}`;
      grouped.set(key, [...(grouped.get(key) ?? []), challenge]);
    }
    return [...grouped.values()];
  }, [challengeData]);

  async function handleOpenChallenge(challengeId: number) {
    try {
      const { path } = await openChallenge.mutateAsync(challengeId);
      router.push(path);
    } catch {
      toast.danger("Challenge gagal dibuka. Pastikan waktu pengerjaan masih aktif.");
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-black">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-black">
        <span className="font-bold text-slate-900 dark:text-white">EduQuest Siswa</span>
        <div className="flex items-center gap-1">
          <Link href="/siswa/riwayat" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-teal-700 hover:bg-teal-50 dark:hover:bg-teal-400/10"><History size={16} /> Riwayat</Link>
          <Button variant="tertiary" size="sm" isPending={logout.isPending} onPress={() => logout.mutate()}><LogOut size={16} /> Keluar</Button>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 sm:p-8">
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
            <div><p className="font-semibold text-slate-900 dark:text-white">Belum ada challenge aktif</p><p className="mt-1 text-sm text-slate-500">Challenge akan muncul ketika dosen mempublikasikannya sesuai jadwal WIB.</p></div>
          </div>
        ) : null}

        {groups.map((group) => (
          <section key={`${group[0].classId}:${group[0].topicId}`} className="flex flex-col gap-3">
            <div><p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{group[0].className}</p><h2 className="text-lg font-semibold text-slate-900 dark:text-white">{group[0].topicName}</h2></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {group.map((challenge) => (
                <article key={challenge.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900 dark:text-white">{challenge.title}</h3><p className="mt-1 text-sm text-slate-500">{challenge.description || "Tanpa deskripsi"}</p></div><Trophy className="shrink-0 text-amber-500" size={20} /></div>
                  <p className="text-xs text-slate-500">{challenge.pointsReward} poin · {challenge.timerSeconds ? `${Math.ceil(challenge.timerSeconds / 60)} menit` : "Tanpa timer"}</p>
                  <Button isPending={openChallenge.isPending && openChallenge.variables === challenge.id} isDisabled={openChallenge.isPending} className="mt-auto bg-teal-600 text-white hover:bg-teal-700" onPress={() => handleOpenChallenge(challenge.id)}><Play size={16} /> Mulai / lanjutkan</Button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
