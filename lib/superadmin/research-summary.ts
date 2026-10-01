import type { SchoolComparison } from "@/types";

export const researchNumber = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 });
export const formatResearchNumber = (value: number | null) => value === null ? "—" : researchNumber.format(value);

export function getAssessmentStatus(school: SchoolComparison): "empty" | "pending" | "complete" {
  if (school.lockedAttemptCount === 0) return "empty";
  return school.lockedAttemptCount > school.scoredAttemptCount ? "pending" : "complete";
}

export function summarizeComparison(schools: SchoolComparison[]) {
  const lockedCount = schools.reduce((sum, item) => sum + item.lockedAttemptCount, 0);
  const finalCount = schools.reduce((sum, item) => sum + item.scoredAttemptCount, 0);
  const scoredSchools = schools.filter((item) => item.scoredAttemptCount > 0 && item.averageScore !== null);
  const weightedCount = scoredSchools.reduce((sum, item) => sum + item.scoredAttemptCount, 0);
  return {
    lockedCount,
    finalCount,
    pendingCount: Math.max(0, lockedCount - finalCount),
    completeness: lockedCount > 0 ? finalCount / lockedCount * 100 : null,
    schoolsWithScores: scoredSchools.length,
    // School averages are rounded by the API, so this pooled average is approximate.
    averageScore: weightedCount > 0
      ? scoredSchools.reduce((sum, item) => sum + item.averageScore! * item.scoredAttemptCount, 0) / weightedCount
      : null,
  };
}

export function buildSchoolComparisonCsv(schools: SchoolComparison[]): string {
  const headers = ["school_id", "school_name", "student_count", "locked_attempt_count", "scored_attempt_count", "pending_attempt_count", "assessment_complete_percent", "average_raw_score", "median_raw_score", "minimum_raw_score", "maximum_raw_score"];
  const escape = (value: string | number | null) => {
    const text = value === null ? "" : String(value);
    const safe = typeof value === "string" && /^[\s]*[=+@-]/.test(text) ? `'${text}` : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  const rows = schools.map((school) => [school.schoolId, school.schoolName, school.studentCount,
    school.lockedAttemptCount, school.scoredAttemptCount, Math.max(0, school.lockedAttemptCount - school.scoredAttemptCount),
    school.lockedAttemptCount > 0 ? Number((school.scoredAttemptCount / school.lockedAttemptCount * 100).toFixed(2)) : null,
    school.averageScore, school.medianScore, school.minimumScore, school.maximumScore,
  ].map(escape).join(","));
  return "\uFEFF" + [headers.map(escape).join(","), ...rows].join("\r\n");
}

export function downloadSchoolComparison(schools: SchoolComparison[]) {
  const url = URL.createObjectURL(new Blob([buildSchoolComparisonCsv(schools)], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "gerakgamify-perbandingan-sekolah.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
