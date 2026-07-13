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
} as const;

export function buildTitle(title: string): string {
  return `${title} | ${siteConfig.name}`;
}
