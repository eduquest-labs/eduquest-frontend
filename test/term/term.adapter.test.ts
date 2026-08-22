import { describe, expect, it } from "vitest";

import {
  adaptStudentOwnTermProgressEntry,
  adaptStudentTermProgressEntry,
  adaptTerm,
  adaptTermThresholdHistoryEntry,
} from "@/services/adapters";

describe("term adapters", () => {
  it("adapts a term contract", () => {
    const result = adaptTerm({
      id: 1,
      class_id: 2,
      name: "Termin 1",
      sort_order: 0,
      threshold_percent: "60.00",
      release_at: null,
      randomize_questions: false,
    });

    expect(result).toEqual({
      id: 1,
      classId: 2,
      name: "Termin 1",
      sortOrder: 0,
      thresholdPercent: 60,
      releaseAt: null,
      randomizeQuestions: false,
    });
  });

  it("adapts a threshold history entry, converting string thresholds to numbers", () => {
    const result = adaptTermThresholdHistoryEntry({
      old_threshold: "60.00",
      new_threshold: "75.00",
      changed_by: 5,
      created_at: "2026-08-22T10:00:00+07:00",
    });

    expect(result).toEqual({
      oldThreshold: 60,
      newThreshold: 75,
      changedBy: 5,
      createdAt: "2026-08-22T10:00:00+07:00",
    });
  });

  it("adapts a null old_threshold correctly", () => {
    const result = adaptTermThresholdHistoryEntry({
      old_threshold: null,
      new_threshold: "60.00",
      changed_by: 5,
      created_at: "2026-08-22T10:00:00+07:00",
    });

    expect(result.oldThreshold).toBeNull();
  });

  it("adapts a student term progress entry", () => {
    const result = adaptStudentTermProgressEntry({
      class_student_id: 3,
      student_name: "Budi",
      status: "passed",
      source: "auto",
      feedback: null,
    });

    expect(result).toEqual({
      classStudentId: 3,
      studentName: "Budi",
      status: "passed",
      source: "auto",
      feedback: null,
    });
  });

  it("adapts a student's own term progress entry", () => {
    const result = adaptStudentOwnTermProgressEntry({
      term_id: 1,
      term_name: "Termin 1",
      sort_order: 0,
      status: "in_progress",
      source: "auto",
    });

    expect(result).toEqual({
      termId: 1,
      termName: "Termin 1",
      sortOrder: 0,
      status: "in_progress",
      source: "auto",
    });
  });
});
