import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import { adaptBankFolder, adaptBankMaterial } from "@/services/adapters";
import type { BankFolderContract, BankMaterialContract, BankPageContract } from "@/lib/contracts/activity-bank";
import type { BankActionResult, BankCommand, BankListParams, BankMaterialInput, BankPage } from "@/types";
const endpoints = API_ENDPOINTS.ACTIVITY_BANK;
export async function listBankFolders() {
  const { data } = await client.get<{ data: BankFolderContract[] }>(endpoints.FOLDERS);
  return data.data.map(adaptBankFolder);
}
export async function listBankMaterials(params: BankListParams): Promise<BankPage> {
  const { data } = await client.get<BankPageContract>(endpoints.MATERIALS, { params: { collection: params.collection, folder_id: params.folderId, search: params.search, page: params.page } });
  return { data: data.data.map(adaptBankMaterial), total: data.total, currentPage: data.current_page, lastPage: data.last_page };
}
export async function getBankMaterial(id: number) {
  const { data } = await client.get<BankMaterialContract>(endpoints.MATERIAL(id));
  return adaptBankMaterial(data);
}
function materialPayload(input: BankMaterialInput) {
  return {
    folder_id: input.folderId, title: input.title, summary: input.summary, objectives: input.objectives, explanation: input.explanation,
    equipment_and_place: input.equipmentAndPlace, steps: input.steps, task_instruction: input.taskInstruction, target_level: input.targetLevel,
    tags: input.tags, media_links: input.mediaLinks, references: input.references,
    questions: input.questions.map((q) => ({
      question_type: q.questionType, question_text: q.questionText, points: q.points, sort_order: q.sortOrder,
      time_limit_seconds: q.timeLimitSeconds, correct_answer_text: q.correctAnswerText,
      options: q.questionType === "pilihan_ganda" ? (q.options ?? []).map((o) => ({ option_text: o.optionText, is_correct: o.isCorrect, sort_order: o.sortOrder })) : null,
    })),
  };
}
export async function runBankCommand(command: BankCommand): Promise<BankActionResult> {
  switch (command.action) {
    case "createFolder":
      await client.post(endpoints.FOLDERS, { name: command.name, collection: command.collection, parent_id: command.parentId }); return {};
    case "updateFolder":
      await client.patch(endpoints.FOLDER(command.id), { name: command.name, parent_id: command.parentId }); return {};
    case "deleteFolder":
      await client.delete(endpoints.FOLDER(command.id)); return {};
    case "saveMaterial": {
      const response = command.id
        ? await client.patch<BankMaterialContract>(endpoints.MATERIAL(command.id), materialPayload(command.input))
        : await client.post<BankMaterialContract>(endpoints.MATERIALS, materialPayload(command.input));
      return { material: adaptBankMaterial(response.data) };
    }
    case "deleteMaterial":
      await client.delete(endpoints.MATERIAL(command.id)); return {};
    case "publish": case "unpublish": {
      const { data } = await client.patch<BankMaterialContract>(endpoints.STATUS(command.id, command.action));
      return { material: adaptBankMaterial(data) };
    }
    case "copy": {
      const { data } = await client.post<BankMaterialContract>(endpoints.COPY(command.id), { folder_id: command.folderId });
      return { material: adaptBankMaterial(data) };
    }
    case "createChallenge": {
      const { data } = await client.post<{ id: number; topic_id: number; class_id: number }>(endpoints.CHALLENGES(command.id), {
        topic_id: command.topicId, title: command.title, type: command.type, question_indices: command.questionIndices, version: command.version,
      });
      return { challenge: { id: data.id, topicId: data.topic_id, classId: data.class_id } };
    }
    case "importQuestions":
      await client.post(endpoints.IMPORT(command.id), { challenge_id: command.challengeId, question_indices: command.questionIndices, version: command.version }); return {};
  }
}
