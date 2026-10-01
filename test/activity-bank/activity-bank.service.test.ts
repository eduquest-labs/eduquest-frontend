import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { listBankMaterials, runBankCommand } from "@/services/modules";

describe("bank service", () => {
  it("sends collection, folder and server pagination filters", async () => {
    server.use(http.get("*/activity-bank/materials", ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get("folder_id")).toBe("2");
      expect(url.searchParams.get("page")).toBe("3");
      expect(url.searchParams.get("collection")).toBe("private");
      return HttpResponse.json({ data: [], total: 25, current_page: 3, last_page: 3 });
    }));
    await expect(listBankMaterials({ folderId: 2, page: 3, collection: "private" })).resolves.toMatchObject({ total: 25, currentPage: 3, lastPage: 3 });
  });
  it("imports selected indices with the version and destination", async () => {
    server.use(http.post("*/activity-bank/materials/7/questions/import", async ({ request }) => {
      expect(await request.json()).toEqual({ challenge_id: 9, question_indices: [0, 2], version: "snapshot-version" });
      return HttpResponse.json({ message: "Imported" }, { status: 201 });
    }));
    await expect(runBankCommand({ action: "importQuestions", id: 7, challengeId: 9, questionIndices: [0, 2], version: "snapshot-version" })).resolves.toEqual({});
  });
  it("preserves server rejection for a published destination", async () => {
    server.use(http.post("*/activity-bank/materials/7/questions/import", () => HttpResponse.json({ message: "Draft only" }, { status: 409 })));
    await expect(runBankCommand({ action: "importQuestions", id: 7, challengeId: 9, questionIndices: [0], version: "v" })).rejects.toMatchObject({ response: { status: 409 } });
  });
});
