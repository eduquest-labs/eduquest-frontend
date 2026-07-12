# EduQuest — Design Document

Status: living document, v1.0 scope. Last synced: 2026-07-13.

## 1. Ringkasan

EduQuest adalah platform gamifikasi pembelajaran (PWA) yang dibangun sebagai instrumen riset untuk mendukung eksperimen kelas di Universitas Pendidikan Indonesia (UPI). Tujuan utamanya bukan menjadi LMS komersial, melainkan menghasilkan data valid dan terstandarisasi untuk artikel ilmiah tentang gamifikasi dalam pembelajaran.

- **Klien**: Pak Regi Dwi Septian, dosen UPI, bertindak sebagai satu-satunya akun `dosen` di sistem.
- **Skala riset**: 5 sekolah × ±15-20 siswa (±75-100 siswa total), multi-institusi.
- **Desain riset**: FULL gamifikasi untuk semua siswa di semua sekolah — tidak ada kelompok kontrol tanpa gamifikasi. Pembanding riset adalah **antar kelas/sekolah** dan **progres individual** (poin → level, kecepatan menyelesaikan tantangan), bukan grup eksperimen vs kontrol.
- **Prinsip desain utama**: integritas dan keutuhan data riset > kelengkapan fitur atau UX mewah. Ini memengaruhi banyak keputusan teknis (soft delete, FK RESTRICT, audit trail, is_locked) yang dijelaskan di §5.

Dokumen sumber: `PRD Project/PRD_Platform_Gamifikasi_Pembelajaran.pdf` dan `PRD Project/schema.sql` (skema asli, sebelum revisi — lihat §5 untuk perubahan yang diterapkan di migration Laravel).

## 2. Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js 16 (App Router) + React 19, PWA (service worker custom via `scripts/generate-sw.js`) |
| UI | HeroUI v3 (beta), Tailwind CSS v4, framer-motion, lucide-react |
| Frontend state/data | Zustand (client state), TanStack Query (server state), Zod (validasi), Axios |
| Auth (frontend) | NextAuth v5 (beta), dikoneksikan ke Passport OAuth2 di backend |
| Backend | Laravel (PHP), REST API |
| Auth (backend) | Laravel Passport (OAuth2, password-grant) + Spatie Laravel Permission (role dosen/siswa) |
| Database | MySQL 8.x, utf8mb4, InnoDB (SQLite in-memory untuk test) |
| Testing | PHPUnit (backend), Vitest + Testing Library (frontend unit), Playwright (frontend e2e) |
| Dokumentasi API | L5-Swagger (OpenAPI dari anotasi PHPDoc), Swagger UI |
| Import data | maatwebsite/excel (CSV/XLSX import siswa) |
| GPS Tracking | Browser Geolocation API, untuk tantangan aktivitas fisik |
| Hosting | VPS (8GB RAM/4 CPU) + SSL, domain `.my.id`, storage jawaban esai di local disk (bukan S3) |

Referensi pola teknis: `C:\backend\gerakajar\gerakajar-backend` — arsitektur Passport OAuth2 (`issueToken()` privat, `AuthorizationServer` in-process) dan Spatie Permission diadopsi dari proyek ini, tapi **filosofi siswa berbeda total** (lihat §4).

## 3. Peran & Struktur Pengguna

Dua role saja, **tidak ada superadmin**:

- **`dosen`** — satu akun (peneliti/klien), mengelola SEMUA 5 sekolah dari 1 login. Kontrol penuh: authoring soal/challenge, manajemen kelas, monitoring, analitik, ekspor data riset.
- **`siswa`** — satu akun per siswa per kelas, sesi/token sendiri untuk mengerjakan kuis, submit jawaban, melihat leaderboard/progress miliknya. Beda filosofi dari Gerak Ajar (di sana siswa adalah data pasif, tidak pernah login) — di EduQuest siswa **wajib** punya sesi sendiri karena validitas data riset by-individual bergantung padanya.

Setiap sekolah = 1 baris di tabel `classes` (`dosen_id` selalu sama, satu dosen mengelola semua).

## 4. Alur Autentikasi

Auth pakai **Laravel Passport (OAuth2 password-grant)**, bukan Sanctum — pola teknis diadopsi dari Gerak Ajar tapi diterapkan berbeda karena siswa perlu identitas aktif, bukan pasif.

### Dosen
1 akun dibuat via seeder/tinker saat setup awal (bukan form register publik). Login email/username + password via Passport password-grant standar. Role `dosen` di-assign lewat Spatie.

### Siswa — 3 tahap: Pre-register → Klaim sekali → Login password

**Tahap 1 — Pre-register massal (dosen)**: dosen upload 1 file CSV/Excel per kelas berisi kolom `name` + `nis`. Endpoint import (`ClassStudentController@import`, pakai `maatwebsite/excel`) insert `users` baru (`role=siswa`, `password=NULL`, `anonymous_id` di-generate) + `class_students` (dengan `nis`). Baris duplikat/bentrok ditolak per-baris dengan laporan error, bukan gagal total 1 file.

**Tahap 2 — Klaim akun (siswa, hanya sekali)**: siswa masukkan `class_code` + `NIS`. Backend cari exact match di `class_students` join `users` dalam scope `class_id`, dengan syarat `users.password IS NULL` (belum diklaim):
- Tidak match → ditolak, "kode kelas atau NIS tidak ditemukan".
- Match tapi sudah pernah diklaim → ditolak, "akun ini sudah pernah diaktifkan, silakan login dengan password".
- Match dan belum diklaim → siswa **wajib** set password baru saat itu juga (bagian dari response klaim, bukan langkah terpisah). Password di-hash, `users.password` terisi (klaim ulang jadi tidak mungkin), Passport keluarkan access+refresh token pair.

**Tahap 3 — Login berikutnya**: siswa login dengan identifier + password miliknya sendiri (password-grant standar, sama pola dengan dosen). NIS tidak dipakai lagi setelah klaim.

**Kenapa bukan siswa signup bebas / NIS sebagai kredensial permanen**: NIS bukan rahasia (terlihat di absensi/name tag) — kalau jadi kredensial permanen, siapa pun yang tahu NIS siswa lain bisa login sebagai siswa itu selamanya. Validasi kepemilikan (data resmi dari dosen) harus terjadi **sebelum** siswa dapat kontrol permanen (password), bukan sesudahnya.

Logout = revoke token (pola `AuthController::logout` Gerak Ajar).

## 5. Model Data

Skema dasar mengikuti `schema.sql` (6 domain), dengan revisi yang diterapkan di migration Laravel sebelum implementasi (skema asli file tidak diubah).

### 5.1 Domain tabel

1. **Users & RBAC** — `users` (role dosen/siswa dalam satu tabel, `anonymous_id` untuk ekspor riset, `password` nullable untuk siswa pre-register), `classes` (`dosen_id` FK, `class_code` unique), `class_students` (`nis VARCHAR(20) NOT NULL`, unique `(class_id, nis)`, keanggotaan siswa per kelas).
2. **Tantangan & Soal (authoring)** — `topics` → `challenges` (type: kuis/aktivitas_fisik, start/end_time, timer_seconds, `is_published`) → `questions` (pilihan_ganda/isian_singkat/esai, `correct_answer_text` untuk autoscoring isian singkat) → `question_options`.
3. **Submission & Penilaian** — `attempts` (unique per student+challenge, `total_score` GENERATED COLUMN dari `auto_score + manual_score`, `is_locked` setelah submit), `answers` (menangani 3 tipe soal + `answer_file_path`/`answer_file_type` untuk upload esai, `graded_by`/`feedback` untuk esai manual), `point_adjustments` (audit trail koreksi poin manual dosen, wajib `reason`).
4. **Gamifikasi** — `badges` (criteria_type: total_points/challenges_completed/streak/manual), `student_badges`, `student_points` (agregat per kelas, derived cache — lihat §5.2).
5. **Aktivitas Fisik (GPS)** — `physical_activities`, `gps_points` (`sequence_order` untuk rekonstruksi rute).
6. **Log & Analitik Riset** — `activity_logs` (`activity_type` ENUM baku: login, logout, mulai_tantangan, submit_jawaban, lihat_leaderboard, lihat_progress, mulai_aktivitas_fisik, selesai_aktivitas_fisik; `metadata` JSON dengan minimal keys `ip`/`user_agent`), `backup_records`.

Tabel tambahan: **`question_revisions`** — audit trail perubahan soal setelah `is_published=true` (lihat §5.2 poin 3).

### 5.2 Revisi arsitektur terhadap schema.sql asli

Diterapkan sebagai lapisan keputusan sebelum migration Laravel dibuat, demi integritas data riset:

1. **Soft delete** (`deleted_at`) di: `classes`, `challenges`, `questions`, `attempts`, `answers`, `physical_activities`. Dosen bisa "hapus" via UI, tapi submission siswa adalah data riset yang tidak boleh hilang permanen.
2. **FK dari data riset ke parent → RESTRICT** (bukan CASCADE dari skema asli): `attempts.challenge_id`, `answers.attempt_id`, `answers.question_id`, `gps_points.activity_id`, `physical_activities.challenge_id`. Mencegah hapus 1 challenge/question tidak sengaja menghancurkan attempt/jawaban yang sudah submit. FK struktural murni (`class_students.class_id`, `topics.class_id`) tetap CASCADE.
3. **`student_points` adalah derived cache eksplisit**, bukan source of truth. Kolom `last_synced_at`. Update HANYA lewat Eloquent Observer di model `Attempt` dan `PointAdjustment` — source of truth tetap `attempts.total_score` + `point_adjustments`, sehingga cache bisa direbuild kapan saja.
4. **`question_revisions`** — audit trail via `QuestionObserver::updating()`: kalau `challenges.is_published=true` dan `question_text`/`correct_answer_text`/`points` berubah, simpan snapshot versi lama sebelum update diterapkan. Tidak memblokir edit, tapi setiap perubahan pada soal published tercatat.
5. **Tidak ada `research_groups`** — dihapus total dari skema (lihat §1: desain riset full gamifikasi, tidak ada grup kontrol).

### 5.3 Upload jawaban esai (di luar PRD asli)

Keputusan tambahan: siswa boleh upload foto/video sebagai jawaban esai (melengkapi/menggantikan `answer_text`). Upload bukti aktivitas fisik tetap GPS-only sesuai PRD asli, tidak diubah.

- Kolom tambahan `answers`: `answer_file_path VARCHAR(255) NULL`, `answer_file_type ENUM('image','video') NULL`.
- Storage: local disk VPS di `storage/app/private/answers/{attempt_id}/{question_id}.ext` — **bukan** `storage/app/public` (tidak auto-exposed via symlink publik).
- Batas ukuran: foto max 5MB, video max 50MB. Validasi MIME type ketat di app layer (bukan cuma ekstensi file).
- Akses file wajib lewat route terautentikasi yang mengecek requester adalah siswa pemilik attempt ATAU dosen pemilik kelas terkait — tidak ada URL publik langsung.
- File jawaban esai adalah data riset, ikut aturan RESTRICT + soft delete (§5.2 poin 1-2).

## 6. Aturan Bisnis Kritis

Aturan yang harus dijaga di level backend (bukan hanya UI), karena aplikasi ini instrumen riset ilmiah:

- **Submit bersifat final**: setelah `attempt` di-submit, `is_locked=true`, tidak ada endpoint edit ulang. Enforce di backend setiap endpoint attempt/answer.
- **Anonimisasi wajib di ekspor**: seluruh ekspor data riset (CSV/XLSX) pakai `anonymous_id`, tidak pernah nama asli — untuk kebutuhan etik publikasi ilmiah.
- **Esai dinilai manual**: PG & isian singkat auto-scoring; esai menunggu dosen menilai (`graded_by`, `feedback`) sebelum skor akhir muncul.
- **Poin manual harus tercatat**: setiap koreksi poin oleh dosen wajib `reason`, masuk audit trail `point_adjustments`, termasuk yang negatif.
- **Randomisasi grup & informed consent**: ditangani manual oleh dosen di luar aplikasi, bukan fitur v1.0 (tidak relevan lagi karena tidak ada grup kontrol — lihat §1).
- **Performa target**: leaderboard & monitoring real-time <2 detik untuk ±100 pengguna simultan.
- **Keamanan**: password dosen di-hash bcrypt, guard middleware di semua endpoint admin (dosen), siswa juga punya password sendiri sejak klaim (lihat §4) — tidak ada endpoint yang bisa diakses tanpa token valid sesuai role.

### Out of scope v1.0 (kecuali diminta eksplisit)

Push notification, offline-first penuh (hanya PWA shell dasar), broadcast pengumuman, filter/segmentasi data lanjutan, profil & avatar siswa, moderasi bukti tugas — dicadangkan Fase 2. **Pengecualian**: upload foto/video jawaban esai (§5.3) sudah masuk scope v1.0 atas permintaan eksplisit user, meski PRD asli menandainya out-of-scope.

## 7. Fitur Tambahan di Luar PRD Asli

### Duplikasi Challenge

Dosen merotasi jenis tantangan aktivitas fisik antar 5 sekolah per periode (mis. minggu 1: Kelas A=push-up, Kelas C=pull-up; minggu 2 bergantian). Solusinya **bukan** rotasi otomatis (overengineering untuk skala 5 kelas), melainkan fitur duplikasi manual:

- `POST /api/challenges/{id}/duplicate` dengan body `{ target_topic_id }`.
- Proses: clone `challenges` + semua `questions` + `question_options` terkait ke topic/class tujuan. Hasil adalah row baru independen (edit di kelas tujuan tidak memengaruhi asal).
- `is_published=false` di hasil duplikat — dosen wajib review/edit sebelum publish ke kelas baru.
- Tidak butuh perubahan skema, murni logic aplikasi di `ChallengeController@duplicate`.

## 8. Testing & Dokumentasi API

**Testing**: PHPUnit (bukan Pest — `pestphp/pest-plugin` di `composer.json` hanya izin plugin, bukan dependency aktif). `phpunit.xml` pakai SQLite in-memory. Perhatian khusus: generated column `total_score` (sintaks MySQL) harus tetap valid di SQLite untuk test suite.

Prioritas test (jalur yang merusak validitas riset kalau salah, bukan coverage tinggi):
- `is_locked` enforcement — attempt yang sudah submit tidak bisa diedit lewat endpoint manapun.
- Auto-scoring PG & isian singkat.
- Anonimisasi ekspor — nama asli tidak pernah bocor ke CSV/XLSX.
- Upload jawaban esai — validasi MIME/ukuran, akses file terproteksi kepemilikan.
- RBAC guard — siswa tidak bisa akses endpoint dosen dan sebaliknya.

**Dokumentasi API**: L5-Swagger (dari `darkaonline/l5-swagger`, generate OpenAPI spec dari anotasi `@OA\...` di controller) + Swagger UI. Setiap controller baru wajib disertai anotasi sejak ditulis. Dipilih di atas Scribe untuk portabilitas ke Postman/codegen frontend, meski proyek dikerjakan solo.

## 9. Status Implementasi (per 2026-07-13)

Backend (`eduquest-backend`) mencakup fondasi auth + manajemen kelas:
- Migration: users, cache, jobs (default Laravel), OAuth (Passport tables), permission tables (Spatie), `classes`, `class_students`.
- Controllers: `AuthController` (login/claim-student/refresh/logout/me), `ClassController` (index/store/show/students — create kelas, lihat class_code, lihat roster siswa), `ClassStudentController` (import CSV/Excel).
- Models: `ClassModel` (termasuk `generateClassCode()`, retry-loop 5x untuk keunikan), `ClassStudent`, `User`.
- Policy: `ClassPolicy` (`view`/`update`, dosen hanya bisa akses kelas miliknya sendiri).
- Test: `tests/Feature/ClassManagementTest.php`, 13 kasus (create, list scoping, detail/ownership, validasi, import CSV happy-path + duplicate-NIS rejection, roster listing).

Frontend (`eduquest-frontend`) sudah punya:
- Route group `(auth)`, `(dosen)`, `(siswa)` di App Router, plus PWA shell (service worker registration, offline page).
- Domain `auth` (login dosen, klaim akun siswa) dan `kelas` (buat kelas → lihat class_code → impor siswa via CSV → lihat roster) lengkap end-to-end mengikuti 9-step domain checklist di `CLAUDE.md`.
- Dashboard shell (`components/base/layout/DashboardShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`) membungkus route group `(dosen)` — sebelumnya `(dosen)/layout.tsx` cuma guard tanpa UI apa pun.
- `services/endpoints.ts` pakai konvensi `API_ENDPOINTS` (SCREAMING_SNAKE_CASE), disamakan dengan `gerakajar-frontend`.

Domain tabel lain (topics/challenges/questions, attempts/answers, gamifikasi, GPS, activity_logs, `question_revisions`) **belum ada migration-nya** — jadi urutan kerja berikutnya yang wajar mengikuti domain di §5.1.

## 10. Referensi Cepat

- PRD & schema asli: `PRD Project/PRD_Platform_Gamifikasi_Pembelajaran.pdf`, `PRD Project/schema.sql`
- Pola auth referensi: `C:\backend\gerakajar\gerakajar-backend\app\Http\Controllers\AuthController.php`
- Backend root: `eduquest-backend/`
- Frontend root: `eduquest-frontend/`
