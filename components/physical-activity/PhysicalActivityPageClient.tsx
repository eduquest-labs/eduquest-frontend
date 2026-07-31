"use client";

import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CloudOff,
  LocateFixed,
  MapPin,
  Radio,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Timer,
  TriangleAlert,
  Wifi,
} from "lucide-react";
import { Alert, Button, Skeleton } from "@heroui/react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";

import { PhysicalActivityMapShell } from "@/components/physical-activity/PhysicalActivityMapShell";
import { usePhysicalActivityRoute } from "@/hooks/queries";
import { usePhysicalActivityRecorder } from "@/hooks/usePhysicalActivityRecorder";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
}

function formatDistance(distanceMeters: number): string {
  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(2)} km`
    : `${distanceMeters.toFixed(0)} m`;
}

function StatusPill({
  recording,
  online,
}: {
  recording: boolean;
  online: boolean | null;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
      <span className="relative flex size-2.5">
        {recording ? (
          <motion.span
            className="absolute inline-flex size-full rounded-full bg-rose-400"
            animate={
              reduceMotion
                ? { opacity: 0.35, scale: 1.35 }
                : { opacity: [0.8, 0], scale: [1, 2] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 1.5, repeat: Infinity, ease: "easeOut" }
            }
          />
        ) : null}
        <span
          className={`relative inline-flex size-2.5 rounded-full ${
            recording
              ? "bg-rose-500"
              : online === null
                ? "bg-slate-400"
                : online
                  ? "bg-emerald-400"
                  : "bg-amber-400"
          }`}
        />
      </span>
      {recording
        ? "GPS merekam"
        : online === null
          ? "Memeriksa koneksi"
          : online
            ? "Siap merekam"
            : "Mode offline"}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <motion.div
      layout
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-3 text-xl font-bold tabular-nums text-slate-950 dark:text-white">
        {value}
      </p>
    </motion.div>
  );
}

export function PhysicalActivityPageClient({
  challengeId,
}: {
  challengeId: number;
}) {
  const recorder = usePhysicalActivityRecorder(challengeId);
  const isSettled =
    recorder.status === "completed" || recorder.status === "invalid";
  const route = usePhysicalActivityRoute(
    recorder.activity?.id ?? 0,
    isSettled
  );
  const mapPoints = isSettled
    ? route.data?.points ?? recorder.livePoints
    : recorder.livePoints;
  const isRecording =
    recorder.status === "recording" || recorder.status === "offline";
  const canFinish = isRecording || recorder.status === "error";

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh overflow-hidden bg-slate-50 dark:bg-black">
        <a
          href="#physical-activity-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950"
        >
          Lewati ke perekaman
        </a>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          Status perekaman: {recorder.status}. {recorder.errorMessage ?? ""}
        </div>
        <header className="relative overflow-hidden bg-slate-950 px-4 pb-12 pt-4 text-white sm:px-8 sm:pb-16">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_top_right,var(--color-primary)_0,transparent_38%)]" />
          <div className="relative mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/siswa"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={18} />
                Challenge
              </Link>
              <StatusPill recording={isRecording} online={recorder.isOnline} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28 }}
              className="mt-10 max-w-2xl"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">
                EduQuest Move
              </p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                {recorder.activity?.challenge.title ?? "Tantangan fisik"}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Rekam rute di luar ruangan. Titik GPS disimpan di perangkat dahulu,
                lalu disinkronkan bertahap saat koneksi tersedia.
              </p>
            </motion.div>
          </div>
        </header>

        <main
          id="physical-activity-content"
          className="relative mx-auto -mt-7 flex w-full max-w-5xl flex-col gap-5 px-4 pb-12 sm:-mt-9 sm:gap-6 sm:px-8"
        >
          <AnimatePresence mode="wait">
            {recorder.status === "idle" ? (
              <motion.section
                key="idle"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8 dark:border-white/10 dark:bg-slate-950"
              >
                <div className="grid gap-6 md:grid-cols-[1fr_0.8fr] md:items-center">
                  <div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
                      <LocateFixed size={24} />
                    </div>
                    <h2 className="mt-5 text-2xl font-bold text-slate-950 dark:text-white">
                      Siap mulai bergerak?
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      Izin lokasi baru diminta setelah tombol mulai ditekan. Untuk
                      hasil terbaik, gunakan area terbuka dan biarkan halaman tetap
                      aktif.
                    </p>
                    <Button
                      size="lg"
                      className="mt-6 w-full bg-teal-600 font-semibold text-white shadow-lg shadow-teal-600/20 hover:bg-teal-700 sm:w-auto"
                      onPress={recorder.start}
                    >
                      <Radio size={18} />
                      Mulai merekam
                    </Button>
                  </div>

                  <div className="grid gap-3">
                    {[
                      [<ShieldCheck key="secure" size={18} />, "Raw GPS tetap tersimpan"],
                      [<CloudOff key="offline" size={18} />, "Tahan koneksi lemah"],
                      [<Smartphone key="mobile" size={18} />, "Dioptimalkan untuk mobile"],
                    ].map(([icon, label]) => (
                      <div
                        key={String(label)}
                        className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-white/5 dark:text-slate-200"
                      >
                        <span className="text-teal-600">{icon}</span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>
            ) : null}

            {recorder.status === "requesting_permission" ? (
              <motion.section
                key="permission"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-950"
              >
                <motion.div
                  className="mx-auto flex size-16 items-center justify-center rounded-full bg-teal-50 text-teal-600 dark:bg-teal-400/10"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                >
                  <MapPin size={28} />
                </motion.div>
                <h2 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
                  Menunggu izin lokasi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Pilih “Izinkan” pada dialog browser agar rute dapat direkam.
                </p>
              </motion.section>
            ) : null}

            {isRecording || recorder.status === "finishing" ? (
              <motion.div
                key="recording"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="flex flex-col gap-5"
              >
                <section className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-7 dark:bg-slate-950">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Durasi aktif
                      </p>
                      <p className="mt-2 text-4xl font-black tabular-nums tracking-tight text-slate-950 sm:text-6xl dark:text-white">
                        {formatDuration(recorder.elapsedSeconds)}
                      </p>
                    </div>
                    <div
                      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${
                        recorder.isOnline
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                      }`}
                    >
                      {recorder.isOnline ? <Wifi size={15} /> : <CloudOff size={15} />}
                      {recorder.isOnline ? "Tersambung" : "Tersimpan lokal"}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MetricCard
                      icon={<MapPin size={15} />}
                      label="Titik"
                      value={String(recorder.recordedPointCount)}
                    />
                    <MetricCard
                      icon={<CloudOff size={15} />}
                      label="Antrean"
                      value={String(recorder.queuedPointCount)}
                    />
                    <div className="col-span-2 sm:col-span-1">
                      <MetricCard
                        icon={<Activity size={15} />}
                        label="Status"
                        value={recorder.queuedPointCount === 0 ? "Sinkron" : "Menyimpan"}
                      />
                    </div>
                  </div>
                </section>

                <PhysicalActivityMapShell
                  points={mapPoints}
                  status={recorder.status}
                />

                <Button
                  size="lg"
                  variant="danger"
                  isPending={recorder.status === "finishing"}
                  isDisabled={recorder.status === "finishing"}
                  className="min-h-14 w-full font-bold shadow-lg shadow-rose-600/15"
                  onPress={recorder.finish}
                >
                  <CheckCircle2 size={19} />
                  Selesai dan simpan hasil
                </Button>
              </motion.div>
            ) : null}

            {isSettled && recorder.activity ? (
              <motion.div
                key="settled"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-5"
              >
                <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 dark:border-white/10 dark:bg-slate-950">
                  <div
                    className={`px-5 py-5 sm:px-7 ${
                      recorder.status === "completed"
                        ? "bg-teal-600 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {recorder.status === "completed" ? (
                        <CheckCircle2 size={24} />
                      ) : (
                        <TriangleAlert size={24} />
                      )}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-75">
                          {recorder.status === "completed"
                            ? "Aktivitas tersimpan"
                            : "Aktivitas tidak valid"}
                        </p>
                        <h2 className="mt-1 text-xl font-bold">
                          {recorder.activity.challenge.title}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 divide-x divide-slate-200 p-5 text-center sm:p-7 dark:divide-white/10">
                    <div>
                      <p className="text-xs text-slate-500">Jarak</p>
                      <p className="mt-2 text-lg font-bold text-slate-950 sm:text-2xl dark:text-white">
                        {formatDistance(recorder.activity.distanceMeters)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Durasi</p>
                      <p className="mt-2 text-lg font-bold tabular-nums text-slate-950 sm:text-2xl dark:text-white">
                        {formatDuration(recorder.activity.durationSeconds)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Rata-rata</p>
                      <p className="mt-2 text-lg font-bold text-slate-950 sm:text-2xl dark:text-white">
                        {(recorder.activity.averageSpeedKmh ?? 0).toFixed(1)}
                        <span className="ml-1 text-xs font-medium text-slate-400">km/j</span>
                      </p>
                    </div>
                  </div>
                  <p className="border-t border-slate-200 px-5 py-3 text-center text-xs text-slate-500 sm:px-7 dark:border-white/10">
                    {recorder.activity.acceptedPointsCount} dari{" "}
                    {recorder.activity.gpsPointsCount} titik GPS memenuhi kualitas
                    perhitungan.
                  </p>
                </section>

                {route.isLoading ? (
                  <Skeleton className="h-72 rounded-3xl sm:h-96" />
                ) : (
                  <div className="flex flex-col gap-3">
                    <PhysicalActivityMapShell
                      points={mapPoints}
                      status={recorder.status}
                    />
                    {recorder.status === "invalid" ? (
                      <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
                        <TriangleAlert className="mt-0.5 shrink-0" size={16} />
                        <p>
                          Garis putus-putus menampilkan jejak GPS mentah sebagai
                          referensi. Jejak ini tidak dipakai menghitung jarak karena
                          kualitas titik tidak memenuhi batas akurasi.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                <Link
                  href="/siswa"
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                >
                  Kembali ke challenge
                </Link>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {recorder.errorMessage ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Alert status={recorder.failure === "network" ? "warning" : "danger"}>
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>
                    {recorder.failure === "network"
                      ? "Koneksi terputus"
                      : "Perekaman membutuhkan perhatian"}
                  </Alert.Title>
                  <Alert.Description>{recorder.errorMessage}</Alert.Description>
                </Alert.Content>
                {recorder.failure === "network" && recorder.isOnline ? (
                  <Button size="sm" variant="secondary" onPress={recorder.retrySync}>
                    <RotateCcw size={15} />
                    Sinkronkan
                  </Button>
                ) : null}
                {recorder.status === "error" ? (
                  <Button size="sm" variant="secondary" onPress={recorder.start}>
                    Coba lagi
                  </Button>
                ) : null}
              </Alert>
            </motion.div>
          ) : null}

          {canFinish ? (
            <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
              <Timer className="mt-0.5 shrink-0 text-slate-400" size={16} />
              Versi web tidak dapat menjamin GPS saat layar dikunci. Biarkan EduQuest
              tetap terbuka selama aktivitas berlangsung.
            </div>
          ) : null}
        </main>
      </div>
    </MotionConfig>
  );
}
