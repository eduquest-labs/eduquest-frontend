# EduQuest — Frontend

Frontend PWA untuk **EduQuest**, platform gamifikasi pembelajaran yang dibangun untuk mendukung riset eksperimen kelas multi-sekolah di Universitas Pendidikan Indonesia (UPI). Siswa berinteraksi lewat tantangan, kuis, poin, badge, dan leaderboard; seluruh interaksi tercatat untuk kebutuhan analisis data penelitian.

Repo ini adalah frontend saja. Backend API ada di `../eduquest-backend` (Laravel + MySQL). Dokumen produk (PRD & skema database) ada di `../PRD Project/` — beberapa keputusan (alur auth, NISN sebagai identitas, dll.) sudah berevolusi melampaui dokumen itu; lihat `EduQuest_PRD_Notion.md` untuk revisi yang tercatat inline.

## Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 + HeroUI v3
- TanStack Query v5 (server state) + Zustand (UI state)
- axios, Zod, next-themes, framer-motion
- Testing: Vitest + React Testing Library + MSW, Playwright (E2E)

## Getting Started

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Commands

```bash
npm run dev       # dev server
npm run build     # production build
npm run start     # jalankan production build
npm run lint      # eslint
npm run test      # vitest (unit/integration/component)
npm run test:e2e  # playwright (E2E)
```

## Dua peran pengguna

- **Siswa** — tidak ada self-registration. Dosen pre-register siswa per kelas lewat impor CSV/XLSX (`name`, `nisn`, `jenis_kelamin`). Siswa klaim akun sekali pakai `class_code` + `nisn`, set email + password sendiri, lalu login berikutnya pakai NISN (atau email terverifikasi) + password. Akses: daftar tantangan, kuis, upload jawaban esai (foto/video), leaderboard, progress, riwayat aktivitas, profil (ganti email).
- **Dosen** — login email + password. Akses penuh: dashboard admin, authoring soal (topic/challenge/question), impor & manajemen roster siswa, penjadwalan tantangan, monitoring real-time, koreksi poin manual & badge, penilaian esai manual, ekspor data riset, analitik (perbandingan antar kelas, grafik progres).

## Status implementasi

Seluruh scope PRD v1.0 sudah selesai dibangun dan diverifikasi (test otomatis + sebagian besar juga lewat browser sungguhan) — modul siswa, modul dosen, gamifikasi, GPS tracking, dan analitik riset. Satu item produk masih terbuka: apakah batas waktu per soal (`question.time_limit_seconds`, tersimpan tapi belum di-enforce) perlu diimplementasikan atau di-drop dari spec — lihat `../PRD Project/Pertanyaan_Timer_Per_Soal.md`.

## Konvensi & arsitektur

Aturan struktur folder, data flow, styling, dan konvensi kode ada di [CLAUDE.md](./CLAUDE.md) — baca itu sebelum menambah fitur baru.
