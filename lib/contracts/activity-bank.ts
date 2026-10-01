import type { QuestionContract } from "@/lib/contracts/authoring";
export interface BankFolderContract { id: number; name: string; parent_id: number | null; collection: "shared" | "private"; owner_id: number | null; material_count?: number; }
export interface BankMaterialContract {
  id: number; folder_id: number; folder: BankFolderContract; title: string; status: "draft" | "published"; version: string; created_by: number;
  summary?: string | null; objectives?: string | null; explanation?: string | null; equipment_and_place?: string | null;
  steps?: string | null; task_instruction?: string | null; target_level?: string | null; tags?: string[] | null;
  media_links?: { label: string; url: string }[] | null; references?: { label: string; url: string }[] | null;
  questions?: Partial<QuestionContract>[] | null;
}
export interface BankPageContract { data: BankMaterialContract[]; total: number; current_page: number; last_page: number; }
