import { describe, expect, it } from "vitest";
import { buildSchoolComparisonCsv, getAssessmentStatus, summarizeComparison } from "@/lib/superadmin/research-summary";
import type { SchoolComparison } from "@/types";

const school = (overrides: Partial<SchoolComparison> = {}): SchoolComparison => ({
  schoolId: 1, schoolName: "SMA Bandung", studentCount: 10,
  lockedAttemptCount: 12, scoredAttemptCount: 10,
  averageScore: 80, medianScore: 82, minimumScore: 40, maximumScore: 100,
  ...overrides,
});

describe("research summary", () => {
  it("weights averages by final attempts and excludes schools without scores", () => {
    const summary = summarizeComparison([
      school(), school({ schoolId: 2, scoredAttemptCount: 2, lockedAttemptCount: 2, averageScore: 50 }),
      school({ schoolId: 3, scoredAttemptCount: 0, lockedAttemptCount: 3, averageScore: null }),
    ]);
    expect(summary.finalCount).toBe(12);
    expect(summary.pendingCount).toBe(5);
    expect(summary.averageScore).toBe(75);
    expect(summary.completeness).toBeCloseTo(12 / 17 * 100);
    expect(summary.schoolsWithScores).toBe(2);
  });
  it("distinguishes no data from complete assessment and leaves unknown scores empty", () => {
    expect(getAssessmentStatus(school({ lockedAttemptCount: 0, scoredAttemptCount: 0 }))).toBe("empty");
    expect(getAssessmentStatus(school())).toBe("pending");
    expect(getAssessmentStatus(school({ lockedAttemptCount: 10 }))).toBe("complete");
    expect(summarizeComparison([])).toMatchObject({ averageScore: null, completeness: null });
    expect(summarizeComparison([school({ scoredAttemptCount: 0, averageScore: null })]).averageScore).toBeNull();
  });
  it("exports only aggregate fields with UTF-8 BOM, escaped names and numeric raw scores", () => {
    const csv = buildSchoolComparisonCsv([school({ schoolName: 'SMA "Bandung", Utara' })]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain('"SMA ""Bandung"", Utara"');
    expect(csv).toContain("\"80\"");
    expect(csv).not.toMatch(/email|anonymous_id|student_name/);
    expect(buildSchoolComparisonCsv([school({ averageScore: null })])).not.toContain("null");
  });
  it("neutralizes spreadsheet formulas in school names", () => {
    expect(buildSchoolComparisonCsv([school({ schoolName: '=HYPERLINK("url")' })])).toContain('"\'=HYPERLINK');
  });
});
