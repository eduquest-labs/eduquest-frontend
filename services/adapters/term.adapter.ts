import type {
  StudentOwnTermProgressEntryContract,
  StudentTermProgressEntryContract,
  TermContract,
  TermThresholdHistoryEntryContract,
} from "@/lib/contracts/term";
import type {
  StudentOwnTermProgress,
  StudentTermProgressEntry,
  Term,
  TermThresholdHistoryEntry,
} from "@/types";

export function adaptTerm(contract: TermContract): Term {
  return {
    id: contract.id,
    classId: contract.class_id,
    name: contract.name,
    sortOrder: contract.sort_order,
    thresholdPercent: Number(contract.threshold_percent),
    releaseAt: contract.release_at,
    randomizeQuestions: contract.randomize_questions,
  };
}

export function adaptTermThresholdHistoryEntry(
  contract: TermThresholdHistoryEntryContract
): TermThresholdHistoryEntry {
  return {
    oldThreshold: contract.old_threshold === null ? null : Number(contract.old_threshold),
    newThreshold: Number(contract.new_threshold),
    changedBy: contract.changed_by,
    createdAt: contract.created_at,
  };
}

export function adaptStudentTermProgressEntry(
  contract: StudentTermProgressEntryContract
): StudentTermProgressEntry {
  return {
    classStudentId: contract.class_student_id,
    studentName: contract.student_name,
    status: contract.status,
    source: contract.source,
    feedback: contract.feedback,
  };
}

export function adaptStudentOwnTermProgressEntry(
  contract: StudentOwnTermProgressEntryContract
): StudentOwnTermProgress {
  return {
    termId: contract.term_id,
    termName: contract.term_name,
    sortOrder: contract.sort_order,
    status: contract.status,
    source: contract.source,
  };
}
