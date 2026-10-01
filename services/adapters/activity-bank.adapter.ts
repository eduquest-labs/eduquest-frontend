import type { BankFolderContract, BankMaterialContract } from "@/lib/contracts/activity-bank";
import type { BankFolder, BankMaterial } from "@/types";
export function adaptBankFolder(raw: BankFolderContract): BankFolder {
  return { id: raw.id, name: raw.name, parentId: raw.parent_id, collection: raw.collection, ownerId: raw.owner_id, materialCount: raw.material_count ?? 0 };
}
export function adaptBankMaterial(raw: BankMaterialContract): BankMaterial {
  return {
    id: raw.id, folderId: raw.folder_id, folder: adaptBankFolder(raw.folder), title: raw.title, status: raw.status, version: raw.version, createdBy: raw.created_by,
    summary: raw.summary ?? "", objectives: raw.objectives ?? "", explanation: raw.explanation ?? "", equipmentAndPlace: raw.equipment_and_place ?? "",
    steps: raw.steps ?? "", taskInstruction: raw.task_instruction ?? "", targetLevel: raw.target_level ?? "", tags: raw.tags ?? [],
    mediaLinks: raw.media_links ?? [], references: raw.references ?? [],
    questions: (raw.questions ?? []).map((q, index) => ({
      questionType: q.question_type ?? "esai", questionText: q.question_text ?? "", points: q.points ?? 10, sortOrder: q.sort_order ?? index,
      timeLimitSeconds: q.time_limit_seconds ?? null, correctAnswerText: q.correct_answer_text ?? null,
      options: (q.options ?? []).map((o, order) => ({ optionText: o.option_text, isCorrect: o.is_correct, sortOrder: o.sort_order ?? order })),
    })),
  };
}
