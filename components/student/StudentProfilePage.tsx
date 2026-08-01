"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Award,
  BadgeCheck,
  GraduationCap,
  IdCard,
  Mail,
  ShieldAlert,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  Alert,
  Button,
  Chip,
  FieldError,
  Form,
  Input,
  Label,
  Skeleton,
  TextField,
  toast,
} from "@heroui/react";
import { MotionConfig, motion } from "framer-motion";

import { authKeys, useMe, useMyBadges, useMyPoints } from "@/hooks/queries";
import { resendEmailVerification, updateStudentProfile } from "@/services/modules";

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function StudentProfilePage() {
  const me = useMe();
  const points = useMyPoints();
  const badges = useMyBadges();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (searchParams.get("email_verified") === "1") {
      void queryClient.invalidateQueries({ queryKey: authKeys.me });
      toast.success("Email berhasil diverifikasi.");
    }
  }, [queryClient, searchParams]);

  if (me.isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl space-y-4">
        <Skeleton className="h-44 w-full rounded-3xl" />
        <Skeleton className="h-28 w-full rounded-3xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!me.data) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>Profil gagal dimuat.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const email = emailOverride ?? me.data.email ?? "";
  const isVerified = me.data.emailVerified;
  const earnedBadges = badges.data ?? [];
  const classes = points.data?.classes ?? [];

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) {
      setEmailError("Format email tidak valid.");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await updateStudentProfile(normalized);
      queryClient.setQueryData(authKeys.me, updated);
      setEmailOverride(updated.email);
      toast.success("Email diperbarui. Cek inbox untuk verifikasi.");
      setEmailError(null);
    } catch {
      setEmailError("Email tidak dapat digunakan atau gagal disimpan.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        className="mx-auto w-full max-w-3xl space-y-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        <motion.header
          variants={sectionVariants}
          className="relative overflow-hidden rounded-3xl border border-teal-200/80 bg-linear-to-br from-white via-teal-50 to-cyan-100/80 p-6 shadow-[0_18px_50px_-28px_rgba(13,148,136,0.7)] sm:p-7 dark:border-teal-400/20 dark:from-slate-950 dark:via-teal-950/70 dark:to-cyan-950/60"
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-20 size-52 rounded-full bg-teal-300/25 blur-3xl dark:bg-teal-400/15"
          />
          <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:gap-6 sm:text-left">
            <span className="grid size-20 shrink-0 place-items-center rounded-3xl bg-teal-600 font-display text-2xl font-bold text-white shadow-lg shadow-teal-600/25 sm:size-24 sm:text-3xl">
              {initials(me.data.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                {me.data.name}
              </h1>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-slate-600 sm:justify-start dark:text-slate-300">
                <IdCard aria-hidden="true" size={15} />
                <span className="font-mono">{me.data.nisn ?? "NISN belum tersedia"}</span>
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {points.data ? (
                  <>
                    <Chip color="success" size="sm" variant="soft">
                      <Trophy aria-hidden="true" size={13} /> Level {points.data.level.level}
                    </Chip>
                    <Chip size="sm" variant="soft">
                      {points.data.totalPoints.toLocaleString("id-ID")} XP
                    </Chip>
                  </>
                ) : null}
                <Chip color={isVerified ? "success" : "warning"} size="sm" variant="soft">
                  {isVerified ? (
                    <>
                      <BadgeCheck aria-hidden="true" size={13} /> Email terverifikasi
                    </>
                  ) : (
                    <>
                      <ShieldAlert aria-hidden="true" size={13} /> Belum terverifikasi
                    </>
                  )}
                </Chip>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.div variants={sectionVariants} className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
                <GraduationCap aria-hidden="true" size={16} />
              </span>
              <h2 className="text-sm font-semibold">Kelas</h2>
            </div>
            {classes.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {classes.map((classItem) => (
                  <li
                    key={classItem.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/5"
                  >
                    <span className="min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                      {classItem.name}
                    </span>
                    <span className="shrink-0 text-sm font-semibold text-teal-700 dark:text-teal-300">
                      {classItem.totalPoints.toLocaleString("id-ID")} poin
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Belum tergabung di kelas mana pun.</p>
            )}
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="grid size-8 place-items-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <Award aria-hidden="true" size={16} />
                </span>
                <h2 className="text-sm font-semibold">Badge</h2>
              </div>
              {earnedBadges.length > 0 ? (
                <Chip color="accent" size="sm" variant="soft">
                  {earnedBadges.length}
                </Chip>
              ) : null}
            </div>
            {earnedBadges.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {earnedBadges.map((studentBadge) => (
                  <span
                    key={studentBadge.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-800 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200"
                  >
                    <Sparkles aria-hidden="true" size={12} />
                    {studentBadge.badge.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">
                Belum ada badge. Selesaikan challenge untuk membukanya.
              </p>
            )}
          </article>
        </motion.div>

        <motion.article
          variants={sectionVariants}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-white/5"
        >
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200">
              <Mail aria-hidden="true" size={16} />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Email untuk login</h2>
              <p className="text-xs text-slate-500">
                Nama dan NISN berasal dari data sekolah dan tidak dapat diubah.
              </p>
            </div>
          </div>

          <Form onSubmit={save} validationBehavior="aria" className="mt-4 flex flex-col gap-4">
            <TextField
              name="email"
              type="email"
              value={email}
              onChange={setEmailOverride}
              isInvalid={Boolean(emailError)}
              isDisabled={isSaving}
            >
              <Label>Email</Label>
              <Input fullWidth autoComplete="email" />
              {emailError ? <FieldError>{emailError}</FieldError> : null}
            </TextField>

            <Alert status={isVerified ? "success" : "warning"}>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  {isVerified
                    ? "Email sudah terverifikasi dan dapat digunakan untuk login."
                    : "Email belum terverifikasi. Untuk sementara, login menggunakan NISN."}
                </Alert.Description>
              </Alert.Content>
            </Alert>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                isPending={isSaving}
                isDisabled={isSaving}
                className="min-h-11 bg-teal-600 text-white"
              >
                Simpan email
              </Button>
              {!isVerified ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11"
                  isPending={isResending}
                  onPress={async () => {
                    setIsResending(true);
                    try {
                      await resendEmailVerification();
                      toast.success("Jika email belum terverifikasi, tautan baru akan dikirim.");
                    } catch {
                      toast.danger("Tautan verifikasi belum dapat dikirim.");
                    } finally {
                      setIsResending(false);
                    }
                  }}
                >
                  Kirim ulang verifikasi
                </Button>
              ) : null}
            </div>
          </Form>
        </motion.article>
      </motion.section>
    </MotionConfig>
  );
}
