"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Button, Skeleton } from "@heroui/react";
import { ArrowUpRight, BookOpen, FlaskConical, GraduationCap, School, Users } from "lucide-react";

import { useSuperadminSchools } from "@/hooks/queries";
import { useSuperadminDashboard } from "@/hooks/queries/useSuperadminDashboard";
import type { ResearchDashboardFilters } from "@/lib/contracts/superadmin-dashboard";
import { formatResearchNumber as number } from "@/lib/superadmin/research-summary";
import { AssessmentProgress, ResearchEmpty, ResearchPage, ResearchPanel, researchStyles as shared } from "@/components/superadmin-shared/ResearchUI";
import { ResearchActivityChart } from "./ResearchActivityChart";
import styles from "./SuperadminDashboard.module.css";

function dateInJakarta(daysAgo = 0) {
  const date = new Date(Date.now() - daysAgo * 86400000);
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const part = (type: string) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const TIME_FORMAT = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
const DATE_FORMAT = new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric" });

export function SuperadminDashboardPageClient() {
  const [filters, setFilters] = useState<ResearchDashboardFilters>(() => ({ start_date: dateInJakarta(29), end_date: dateInJakarta() }));
  const [draft, setDraft] = useState(filters);
  const [filterError, setFilterError] = useState("");
  const query = useSuperadminDashboard(filters);
  const schoolOptions = useSuperadminSchools();
  const snapshot = query.data;
  const overview = snapshot?.overview;
  const unavailable = query.isLoading || query.isError;
  const schools = snapshot?.schools ?? [];
  const pendingSchools = schools.filter((school) => school.pending_count > 0).sort((a, b) => b.pending_count - a.pending_count);
  const noParticipation = schools.filter((school) => school.student_count > 0 && school.participant_count === 0).length;

  function updateFilters(next: ResearchDashboardFilters) {
    setDraft(next);
    const rangeDays = (Date.parse(next.end_date) - Date.parse(next.start_date)) / 86400000 + 1;
    if (!Number.isFinite(rangeDays) || rangeDays < 1 || rangeDays > 90 || next.end_date > dateInJakarta()) {
      setFilterError("Pilih rentang 1–90 hari sampai hari ini.");
      return;
    }
    setFilterError("");
    setFilters(next);
  }

  return (
    <ResearchPage>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}><FlaskConical size={16} aria-hidden="true" /> Ruang peneliti · Universitas Pendidikan Indonesia</p>
          <h1>Ikhtisar pelaksanaan riset</h1>
          <p className={styles.intro}>Dari partisipasi siswa hingga hasil penilaian. Pantau apa yang berjalan dan bagian yang perlu ditindaklanjuti.</p>
          <nav className={styles.links} aria-label="Pengelolaan riset">
            <Link href="/superadmin/schools">Kelola Sekolah <ArrowUpRight size={13} aria-hidden="true" /></Link>
            <Link href="/superadmin/guru">Kelola Guru <ArrowUpRight size={13} aria-hidden="true" /></Link>
            <Link href="/superadmin/analytics">Analitik Sekolah <ArrowUpRight size={13} aria-hidden="true" /></Link>
          </nav>
        </div>
        <div className={styles.researchSeal}><strong>GerakGamify</strong><span>Gamifikasi pembelajaran</span><span>Dashboard superadmin</span></div>
      </header>

      <div className={styles.filterBar} role="group" aria-label="Filter dashboard riset">
        <label className={`${styles.field} ${styles.schoolField}`}>Lingkup sekolah
          <select value={draft.school_id ?? ""} onChange={(event) => updateFilters({ ...draft, school_id: event.target.value ? Number(event.target.value) : undefined })} disabled={schoolOptions.isLoading || schoolOptions.isError}>
            <option value="">Semua sekolah</option>
            {(schoolOptions.data ?? []).map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
          </select>
        </label>
        <label className={styles.field}>Dari tanggal<input type="date" required value={draft.start_date} max={draft.end_date} onChange={(event) => updateFilters({ ...draft, start_date: event.target.value })} /></label>
        <label className={styles.field}>Sampai tanggal<input type="date" required value={draft.end_date} min={draft.start_date} max={dateInJakarta()} onChange={(event) => updateFilters({ ...draft, end_date: event.target.value })} /></label>
        <div className={styles.rangePresets} aria-label="Pilihan periode">
          {[7, 30, 90].map((days) => <button type="button" key={days} onClick={() => updateFilters({ ...draft, start_date: dateInJakarta(days - 1), end_date: dateInJakarta() })}>{days} hari</button>)}
        </div>
      </div>
      {filterError ? <p role="alert" className={styles.error}>{filterError}</p> : null}
      {schoolOptions.isError ? <Alert status="warning"><Alert.Content><Alert.Description>Pilihan sekolah gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => schoolOptions.refetch()}>Muat ulang sekolah</Button></Alert> : null}
      <div className={styles.statusLine}>
        <span>{snapshot ? `${DATE_FORMAT.format(new Date(snapshot.period.start_date + "T00:00:00+07:00"))} – ${DATE_FORMAT.format(new Date(snapshot.period.end_date + "T00:00:00+07:00"))} · WIB` : "Memuat periode riset…"}</span>
        <span role="status">{query.isFetching ? "Memperbarui data…" : query.isError ? "Data belum tersedia" : snapshot ? `Diperbarui pukul ${TIME_FORMAT.format(new Date(snapshot.generated_at))} WIB` : ""}</span>
      </div>

      {query.isError ? (
        <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Ringkasan gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => query.refetch()}>Coba lagi</Button></Alert>
      ) : null}

      <section className={styles.stats} aria-label="Ringkasan riset">
        <article className={styles.stat}>
          <div className={styles.statLabel}>Siswa terdaftar <GraduationCap size={19} aria-hidden="true" /></div>
          {query.isLoading ? <Skeleton className="my-4 h-10 w-20 rounded" /> : <strong>{number(unavailable ? null : overview?.student_count ?? null)}</strong>}
          <p>Siswa unik di seluruh kelas dalam lingkup sekolah.</p>
        </article>
        <article className={styles.stat}>
          <div className={styles.statLabel}>Partisipasi siswa <Users size={18} aria-hidden="true" /></div>
          {query.isLoading ? <Skeleton className="my-4 h-10 w-20 rounded" /> : <strong>{overview?.participation_percent !== null && overview?.participation_percent !== undefined && !unavailable ? `${number(overview.participation_percent)}%` : "—"}</strong>}
          <p>{unavailable ? "Mengikuti periode yang dipilih" : `${number(overview?.participant_count ?? 0)} siswa memulai kuis atau aktivitas fisik.`}</p>
        </article>
        <article className={styles.stat}>
          <div className={styles.statLabel}>Pengerjaan skor final <BookOpen size={18} aria-hidden="true" /></div>
          {query.isLoading ? <Skeleton className="my-4 h-10 w-20 rounded" /> : <strong>{number(unavailable ? null : overview?.final_count ?? null)}</strong>}
          <p>{unavailable ? "Kuis dengan penilaian lengkap" : `Dari ${number(overview?.submitted_count ?? 0)} kuis yang dikumpulkan pada periode ini.`}</p>
        </article>
        <article className={styles.stat}>
          <div className={styles.statLabel}>Tantangan berjalan <FlaskConical size={18} aria-hidden="true" /></div>
          {query.isLoading ? <Skeleton className="my-4 h-10 w-20 rounded" /> : <strong>{number(unavailable ? null : overview?.active_challenge_count ?? null)}</strong>}
          <p>Terpublikasi dan terbuka saat ini, lintas kuis dan aktivitas fisik.</p>
        </article>
      </section>

      <div className={styles.coverage} aria-label="Cakupan riset">
        <span><School size={15} aria-hidden="true" /><b>{number(unavailable ? null : overview?.school_count ?? null)}</b> sekolah</span>
        <span><Users size={15} aria-hidden="true" /><b>{number(unavailable ? null : overview?.guru_count ?? null)}</b> guru · {number(unavailable ? null : overview?.active_guru_count ?? null)} akun aktif</span>
        <span><BookOpen size={15} aria-hidden="true" /><b>{number(unavailable ? null : overview?.class_count ?? null)}</b> kelas</span>
      </div>

      {query.isLoading ? <div aria-label="Memuat dashboard riset" className={styles.body}><Skeleton className="h-96 w-full rounded-xl" /><Skeleton className="h-96 w-full rounded-xl" /></div> : null}
      {!unavailable && snapshot && overview ? (
        <>
          <div className={styles.body}>
            <div className={styles.main}>
              <ResearchPanel title="Aktivitas belajar harian" description="Pengerjaan kuis dimulai dan dikumpulkan, berdasarkan tanggal kejadian.">
                <div className={styles.trendStats}>
                  <p><strong>{number(overview.started_count)}</strong> dimulai</p>
                  <p><strong>{number(overview.submitted_count)}</strong> dikumpulkan</p>
                  <p><strong>{number(overview.average_duration_minutes)}</strong> menit rata-rata*</p>
                </div>
                <div className={styles.legend}><span><i />Dimulai</span><span><i />Dikumpulkan</span></div>
                <ResearchActivityChart daily={snapshot.daily} />
                <p className={styles.chartNote}>{overview.started_count === 0 && overview.submitted_count === 0 ? "Belum ada pengerjaan kuis pada periode ini. Ubah periode atau periksa kesiapan tantangan dan kelas." : "*Durasi dihitung dari kuis dengan skor final yang dikumpulkan dalam periode. Retry dihitung sebagai pengerjaan terpisah."}</p>
              </ResearchPanel>
              <ResearchPanel title="Kesiapan tantangan" description="Snapshot status saat ini pada sekolah yang dipilih.">
                <div className={styles.challengeList}>
                  <div><strong>{number(snapshot.challenges.active)}</strong><span>Berjalan</span></div>
                  <div><strong>{number(snapshot.challenges.scheduled)}</strong><span>Terjadwal</span></div>
                  <div><strong>{number(snapshot.challenges.draft)}</strong><span>Draft</span></div>
                  <div><strong>{number(snapshot.challenges.ended)}</strong><span>Berakhir</span></div>
                </div>
              </ResearchPanel>
            </div>
            <aside className={styles.aside} aria-label="Tindak lanjut riset">
              <ResearchPanel title="Antrean penilaian" description="Pengerjaan dengan esai pending, seluruh waktu.">
                <div className={styles.queueNumber}><strong>{number(overview.pending_count)}</strong><span>pengerjaan</span></div>
                <p className={styles.softNote}>{overview.pending_count > 0 ? "Hasil ini belum masuk statistik skor final. Koordinasikan penilaian dengan guru pendamping." : "Tidak ada antrean esai. Kuis yang telah dinilai lengkap siap masuk statistik."}</p>
                {pendingSchools.length > 0 ? <div className={styles.queueList}>{pendingSchools.slice(0, 3).map((school) => <div className={styles.queueRow} key={school.school_id}><span>{school.school_name}</span><b>{number(school.pending_count)}</b></div>)}</div> : null}
                {overview.oldest_pending_at ? <p className={styles.attention}>Pengerjaan tertua sejak {DATE_FORMAT.format(new Date(overview.oldest_pending_at))}.</p> : null}
                <Link href="/superadmin/guru" className="mt-4 inline-flex items-center gap-2 text-sm font-medium">Lihat guru pendamping <ArrowUpRight size={15} aria-hidden="true" /></Link>
              </ResearchPanel>
              <ResearchPanel title="Aktivitas fisik" description="Rekaman selesai dan valid pada periode ini.">
                <div className={styles.physicalNumber}><strong>{number(overview.physical_distance_km)}</strong><span>km tercatat</span></div>
                <div className={shared.factRow}><span>Sesi selesai</span><strong>{number(overview.physical_completed_count)}</strong></div>
                <div className={shared.factRow}><span>Total durasi</span><strong>{number(overview.physical_duration_minutes)} menit</strong></div>
                <p className={styles.softNote}>{overview.physical_completed_count === 0 ? "Belum ada rekaman aktivitas fisik valid yang selesai pada periode ini." : "Rekaman invalid dan yang masih berjalan tidak dihitung dalam jarak maupun durasi."}</p>
              </ResearchPanel>
            </aside>
          </div>

          <ResearchPanel title="Pemantauan per sekolah" description="Gabungkan cakupan siswa, partisipasi, dan kelengkapan hasil untuk menentukan tindak lanjut." aside={<Link href="/superadmin/analytics">Lihat analitik <ArrowUpRight size={14} aria-hidden="true" /></Link>}>
            {schools.length === 0 ? <ResearchEmpty title="Belum ada sekolah" description="Tambahkan sekolah dan kelas untuk memulai pemantauan riset." /> : (
              <div className={shared.tableScroll} tabIndex={0} role="region" aria-label="Pemantauan sekolah, geser untuk melihat semua kolom">
                <table className={`${shared.table} ${styles.schoolTable}`}>
                  <caption className="sr-only">Cakupan dan partisipasi per sekolah</caption>
                  <thead><tr><th scope="col">Sekolah</th><th scope="col">Siswa</th><th scope="col">Partisipasi</th><th scope="col">Dikumpulkan</th><th scope="col">Skor final</th><th scope="col">Rata-rata*</th><th scope="col">Pending**</th></tr></thead>
                  <tbody>{schools.map((school) => (
                    <tr key={school.school_id}>
                      <th scope="row"><span className={shared.schoolName}>{school.school_name}</span><span className={shared.schoolMeta}>{number(school.guru_count)} guru · {number(school.class_count)} kelas</span></th>
                      <td>{number(school.student_count)}</td>
                      <td><div className={styles.participation}><span>{school.participation_percent === null ? "—" : `${number(school.participation_percent)}%`}</span><small>{number(school.participant_count)} siswa berpartisipasi</small><AssessmentProgress finalCount={school.participant_count} lockedCount={school.student_count} label="Partisipasi siswa" /></div></td>
                      <td>{number(school.submitted_count)}</td><td>{number(school.final_count)}</td><td>{number(school.average_raw_score)}</td>
                      <td><span className={school.pending_count > 0 ? shared.pending : shared.neutral}>{number(school.pending_count)}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
            {noParticipation > 0 ? <p className={styles.attention}>{number(noParticipation)} sekolah memiliki siswa terdaftar, tetapi belum ada siswa yang memulai aktivitas pada periode ini.</p> : null}
            <p className={styles.footnote}>*Skor mentah kuis final yang dikumpulkan dalam periode, belum dinormalisasi antar tantangan. **Antrean penilaian seluruh waktu. Jumlah siswa per sekolah dapat tumpang tindih; total siswa di atas dihitung unik.</p>
          </ResearchPanel>
          <details className={shared.methodology}>
            <summary>Definisi indikator riset</summary>
            <p>Partisipasi = siswa yang saat ini terdaftar dan memulai kuis atau rekaman fisik non-invalid dalam periode, dibagi siswa terdaftar. Setiap siswa dihitung sekali meskipun mengulang kuis. Ini bukan ukuran kehadiran atau login.</p>
            <p>Kuis dikumpulkan dihitung dari tanggal selesai; skor final hanya mencakup kuis terkunci tanpa esai pending. Antrean penilaian dan status tantangan menunjukkan kondisi saat ini, tanpa batas periode. Aktivitas fisik selesai dihitung terpisah dari kuis.</p>
            <p>Data siswa ditampilkan sebagai agregat. Perbandingan skor mentah belum membuktikan efek intervensi; analisis pre-test/post-test dan normalisasi membutuhkan instrumen riset yang sebanding.</p>
          </details>
        </>
      ) : null}
    </ResearchPage>
  );
}
