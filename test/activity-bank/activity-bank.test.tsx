import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@/test/helpers/render";
import { adaptBankMaterial } from "@/services/adapters/activity-bank.adapter";
import { BankMaterialForm } from "@/components/activity-bank/BankMaterialForm";

describe("activity bank", () => {
  it("normalizes material ownership and preserves question keys", () => {
    const material = adaptBankMaterial({
      id: 1, folder_id: 2, title: "Jogging", status: "draft", version: "v1",
      created_by: 3, folder: { id: 2, name: "Gerak", parent_id: null, collection: "private", owner_id: 3, material_count: 1 },
      questions: [{ question_type: "isian_singkat", question_text: "GPS?", correct_answer_text: "jarak", points: 10 }],
    });
    expect(material.folder.ownerId).toBe(3);
    expect(material.questions[0].correctAnswerText).toBe("jarak");
    expect(material.questions[0].questionType).toBe("isian_singkat");
  });

  it("rejects blank titles and does not submit incomplete material", async () => {
    const submit = vi.fn();
    renderWithProviders(<BankMaterialForm folders={[{ id: 2, name: "Gerak", parentId: null, collection: "private", ownerId: 3, materialCount: 0 }]} folderId={2} onSubmit={submit} onCancel={vi.fn()} pending={false} />);
    fireEvent.submit(screen.getByRole("button", { name: "Simpan materi" }).closest("form")!);
    expect(await screen.findByText("Judul wajib diisi")).toBeInTheDocument();
    expect(submit).not.toHaveBeenCalled();
  });
});
