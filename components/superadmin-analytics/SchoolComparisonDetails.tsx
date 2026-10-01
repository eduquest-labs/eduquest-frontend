import type { SchoolComparison } from "@/types";
import { formatResearchNumber as number, getAssessmentStatus } from "@/lib/superadmin/research-summary";
import { AssessmentProgress, ResearchPanel, researchStyles as styles } from "@/components/superadmin-shared/ResearchUI";

export function SchoolComparisonDetails({ comparisons }: { comparisons: SchoolComparison[] }) {
  return <ResearchPanel title="Detail per sekolah" description="Agregat hasil belajar tanpa identitas atau skor individual siswa.">
    <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Tabel perbandingan sekolah, geser untuk melihat semua kolom">
      <table className={styles.table}>
        <caption className="sr-only">Perbandingan jumlah pengerjaan dan skor mentah final per sekolah</caption>
        <thead><tr><th scope="col">Sekolah</th><th scope="col">Terkunci</th><th scope="col">Skor final</th><th scope="col">Kelengkapan</th><th scope="col">Rata-rata</th><th scope="col">Median</th><th scope="col">Min–maks</th></tr></thead>
        <tbody>{comparisons.map((school) => {
          const status = getAssessmentStatus(school);
          const pending = Math.max(0, school.lockedAttemptCount - school.scoredAttemptCount);
          return <tr key={school.schoolId}>
            <th scope="row" className="text-left p-4 font-normal"><span className={styles.schoolName}>{school.schoolName}</span><span className={styles.schoolMeta}>{number(school.studentCount)} siswa</span></th>
            <td>{number(school.lockedAttemptCount)}</td><td>{number(school.scoredAttemptCount)}</td>
            <td><span className={`${styles.status} ${status === "empty" ? styles.neutral : status === "pending" ? styles.pending : styles.complete}`}>
              {status === "empty" ? "Belum ada data" : status === "pending" ? `${number(pending)} pending` : "Penilaian lengkap"}
            </span><div className="mt-2"><AssessmentProgress finalCount={school.scoredAttemptCount} lockedCount={school.lockedAttemptCount} /></div></td>
            <td>{number(school.averageScore)}</td><td>{number(school.medianScore)}</td><td>{number(school.minimumScore)} – {number(school.maximumScore)}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </ResearchPanel>;
}
