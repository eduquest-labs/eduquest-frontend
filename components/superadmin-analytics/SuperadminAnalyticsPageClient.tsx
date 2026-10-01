"use client";

import { useState } from "react";
import { Alert, Button, Skeleton } from "@heroui/react";
import { Download } from "lucide-react";
import { useSchoolComparison } from "@/hooks/queries";
import { downloadSchoolComparison, getAssessmentStatus, summarizeComparison } from "@/lib/superadmin/research-summary";
import { ResearchEmpty, ResearchHeader, ResearchMetric, ResearchMetrics, ResearchPage, researchStyles as styles } from "@/components/superadmin-shared/ResearchUI";
import { SchoolAverageScoreChart } from "./SchoolAverageScoreChart";
import { SchoolComparisonDetails } from "./SchoolComparisonDetails";
import { SchoolScoreDistributionChart } from "./SchoolScoreDistributionChart";

export function SuperadminAnalyticsPageClient() {
  const comparison = useSchoolComparison();
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("name");
  const all = comparison.data ?? [];
  const comparisons = all.filter((item) => (schoolFilter === "all" || String(item.schoolId) === schoolFilter) && (statusFilter === "all" || getAssessmentStatus(item) === statusFilter)).sort((a, b) => {
    if (sort === "pending") return (b.lockedAttemptCount - b.scoredAttemptCount) - (a.lockedAttemptCount - a.scoredAttemptCount);
    if (sort === "sample") return b.scoredAttemptCount - a.scoredAttemptCount;
    return a.schoolName.localeCompare(b.schoolName, "id");
  });
  const summary = summarizeComparison(comparisons);
  const hasFinalScores = summary.finalCount > 0;
  const unavailable = comparison.isLoading || comparison.isError;

  return <ResearchPage>
    <ResearchHeader section="Analitik" title="Analitik antar sekolah" description="Baca hasil belajar bersama ukuran sampel pengerjaan dan kelengkapan penilaiannya." actions={<Button variant="secondary" isDisabled={unavailable || comparisons.length === 0} onPress={() => downloadSchoolComparison(comparisons)}><Download size={16} aria-hidden="true" /> Ekspor CSV</Button>} />
    <p className={styles.note}>Perbandingan menggunakan skor mentah, digabung lintas seluruh guru dalam satu sekolah. Attempt dengan esai pending belum masuk statistik skor final.</p>
    <div className={styles.toolbar}>
      <label className={styles.selectLabel}>Sekolah pembanding<select value={schoolFilter} onChange={(event) => setSchoolFilter(event.target.value)} disabled={unavailable}><option value="all">Semua sekolah</option>{all.map((item) => <option value={item.schoolId} key={item.schoolId}>{item.schoolName}</option>)}</select></label>
      <label className={styles.selectLabel}>Status penilaian<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} disabled={unavailable}><option value="all">Semua status</option><option value="pending">Menunggu penilaian</option><option value="complete">Penilaian lengkap</option><option value="empty">Belum ada data</option></select></label>
      <label className={styles.selectLabel}>Urutkan sekolah<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Nama sekolah</option><option value="pending">Pending terbanyak</option><option value="sample">Skor final terbanyak</option></select></label>
      {schoolFilter !== "all" || statusFilter !== "all" || sort !== "name" ? <Button size="sm" variant="tertiary" onPress={() => { setSchoolFilter("all"); setStatusFilter("all"); setSort("name"); }}>Reset filter</Button> : null}
    </div>
    <ResearchMetrics>
      <ResearchMetric label="Sekolah pembanding" value={comparison.isError ? null : comparisons.length} note="Mengikuti pilihan filter" loading={comparison.isLoading} />
      <ResearchMetric label="Pengerjaan skor final" value={comparison.isError ? null : summary.finalCount} note="Termasuk retry yang dinilai lengkap" loading={comparison.isLoading} index={1} />
      <ResearchMetric label="Menunggu penilaian" value={comparison.isError ? null : summary.pendingCount} note="Pengerjaan terkunci dengan esai pending" loading={comparison.isLoading} index={2} />
      <ResearchMetric label="Kelengkapan penilaian (%)" value={comparison.isError ? null : summary.completeness} note="Skor final ÷ pengerjaan terkunci" loading={comparison.isLoading} index={3} />
    </ResearchMetrics>
    {comparison.isError ? <Alert status="danger"><Alert.Indicator /><Alert.Content><Alert.Description>Perbandingan sekolah gagal dimuat.</Alert.Description></Alert.Content><Button size="sm" variant="secondary" onPress={() => comparison.refetch()}>Coba lagi</Button></Alert> : null}
    {comparison.isLoading ? <div aria-label="Memuat perbandingan sekolah" className={styles.charts}><Skeleton className="h-80 w-full rounded-xl" /><Skeleton className="h-80 w-full rounded-xl" /></div> : null}
    {!unavailable && all.length === 0 ? <ResearchEmpty title="Belum ada sekolah" description="Tambahkan sekolah terlebih dahulu agar perbandingan dapat ditampilkan." /> : null}
    {!unavailable && all.length > 0 && comparisons.length === 0 ? <ResearchEmpty title="Tidak ada sekolah yang sesuai" description="Ubah sekolah atau status penilaian untuk melihat hasil lain." /> : null}
    {!unavailable && comparisons.length > 0 ? <>
      <p className={styles.resultCount} role="status">Menampilkan {comparisons.length} dari {all.length} sekolah · grafik, tabel, dan ekspor mengikuti filter yang sama.</p>
      {hasFinalScores ? <section aria-label="Visualisasi perbandingan sekolah" className={styles.charts}><SchoolAverageScoreChart comparisons={comparisons} /><SchoolScoreDistributionChart comparisons={comparisons} /></section> : <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Description>Belum ada skor final. Pengerjaan terkunci yang masih menunggu penilaian esai tetap terlihat pada detail sekolah.</Alert.Description></Alert.Content></Alert>}
      <SchoolComparisonDetails comparisons={comparisons} />
      <details className={styles.methodology}><summary>Cara membaca data dan batas perbandingan</summary>
        <p>Skor final berasal dari pengerjaan terkunci yang seluruh esainya sudah dinilai. Minimum, maksimum, dan median dihitung dari pengerjaan final; siswa yang mengulang dapat berkontribusi lebih dari sekali.</p>
        <p>Grafik rentang menunjukkan minimum–maksimum dan median, bukan histogram atau kuartil. Skor mentah belum dinormalisasi terhadap bobot dan jumlah soal, sehingga perbedaan skor belum membuktikan efektivitas pembelajaran antar sekolah.</p>
        <p>Ekspor CSV memuat agregat sekolah yang sedang ditampilkan, tanpa identitas siswa. Data mencakup seluruh waktu; filter periode dan perbandingan pre-test/post-test membutuhkan dukungan data tersendiri.</p>
      </details>
    </> : null}
  </ResearchPage>;
}
