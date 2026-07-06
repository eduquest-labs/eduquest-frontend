# EduQuest — Frontend

Frontend PWA untuk **EduQuest**, platform gamifikasi pembelajaran yang dibangun untuk mendukung riset eksperimen kelas di Universitas Pendidikan Indonesia (UPI). Siswa berinteraksi lewat tantangan, kuis, poin, badge, dan leaderboard; seluruh interaksi tercatat untuk kebutuhan analisis data penelitian (perbandingan kelompok eksperimen vs kontrol).

Repo ini adalah frontend saja. Backend API ada di `../eduquest-backend` (Laravel + MySQL). Dokumen produk (PRD & skema database) ada di `../PRD Project/`.

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

- **Siswa** — masuk cukup dengan kode kelas + nama, tanpa registrasi/password. Akses: daftar tantangan, kuis, leaderboard, progress, riwayat.
- **Dosen** — login email + password. Akses penuh: dashboard admin, authoring soal, manajemen kelas & siswa, penjadwalan, monitoring real-time, koreksi poin manual, ekspor data riset.

## Konvensi & arsitektur

Aturan struktur folder, data flow, styling, dan konvensi kode ada di [CLAUDE.md](./CLAUDE.md) — baca itu sebelum menambah fitur baru.
