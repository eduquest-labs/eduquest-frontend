import type { QuestionInput } from "@/types/authoring.types";
export type BankCollection = "shared" | "private";
export interface BankFolder { id: number; name: string; parentId: number | null; collection: BankCollection; ownerId: number | null; materialCount: number; }
export interface BankLink { label: string; url: string; }
export interface BankMaterialInput {
  folderId: number; title: string; summary: string; objectives: string; explanation: string; equipmentAndPlace: string;
  steps: string; taskInstruction: string; targetLevel: string; tags: string[]; mediaLinks: BankLink[]; references: BankLink[]; questions: QuestionInput[];
}
export interface BankMaterial extends BankMaterialInput { id: number; folder: BankFolder; status: "draft" | "published"; version: string; createdBy: number; }
export interface BankListParams { collection?: BankCollection; folderId?: number; search?: string; page?: number; }
export interface BankPage { data: BankMaterial[]; total: number; currentPage: number; lastPage: number; }
export interface BankChallengeResult { id: number; topicId: number; classId: number; }
export type BankCommand =
  | { action: "createFolder"; name: string; collection: BankCollection; parentId: number | null }
  | { action: "updateFolder"; id: number; name: string; parentId: number | null }
  | { action: "deleteFolder"; id: number }
  | { action: "saveMaterial"; id?: number; input: BankMaterialInput }
  | { action: "deleteMaterial" | "publish" | "unpublish"; id: number }
  | { action: "copy"; id: number; folderId: number }
  | { action: "createChallenge"; id: number; topicId: number; title: string; type: "kuis" | "aktivitas_fisik"; questionIndices: number[]; version: string }
  | { action: "importQuestions"; id: number; challengeId: number; questionIndices: number[]; version: string };
export interface BankActionResult { material?: BankMaterial; challenge?: BankChallengeResult; }
