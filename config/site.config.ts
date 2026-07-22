export const siteConfig = {
  name: "EduQuest",
  description: "Platform gamifikasi pembelajaran untuk riset eksperimen kelas UPI",
};

/** Per-route <title>/description, appended to `${title} | ${siteConfig.name}` in each page's metadata export. */
export const pageMetadata = {
  login: {
    title: "Masuk",
    description: "Masuk ke akun EduQuest Anda.",
  },
  claim: {
    title: "Aktivasi Akun Siswa",
    description: "Aktifkan akun siswa Anda dengan kode kelas dan NIS.",
  },
  dashboard: {
    title: "Dashboard",
    description: siteConfig.description,
  },
  kelas: {
    title: "Kelas Saya",
    description: "Kelola kelas dan siswa Anda.",
  },
  kelasDetail: {
    title: "Detail Kelas",
    description: "Lihat kode kelas dan kelola daftar siswa.",
  },
  authoring: {
    title: "Authoring",
    description: "Susun topic, challenge, dan soal untuk kelas.",
  },
  challengeEditor: {
    title: "Editor Challenge",
    description: "Kelola metadata challenge, soal, dan opsi jawaban.",
  },
  grading: {
    title: "Penilaian Esai",
    description: "Kelola antrean penilaian jawaban esai per kelas.",
  },
  gradingDetail: {
    title: "Detail Penilaian Esai",
    description: "Beri skor dan feedback pada jawaban esai siswa.",
  },
  studentChallenges: {
    title: "Challenge Siswa",
    description: "Lihat challenge aktif dan lanjutkan pengerjaan siswa.",
  },
  studentAttempt: {
    title: "Pengerjaan Challenge",
    description: "Kerjakan soal, simpan jawaban, dan selesaikan challenge.",
  },
  studentAttemptResult: {
    title: "Hasil Challenge",
    description: "Lihat nilai dan feedback jawaban challenge yang sudah selesai.",
  },
  attemptHistory: {
    title: "Riwayat Aktivitas",
    description: "Lihat seluruh riwayat pengerjaan challenge dan status nilainya.",
  },
} as const;

export function buildTitle(title: string): string {
  return `${title} | ${siteConfig.name}`;
}
