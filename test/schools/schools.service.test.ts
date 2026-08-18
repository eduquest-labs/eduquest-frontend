import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { listSchools } from "@/services/modules";
import { server } from "@/test/msw/server";

describe("schools service", () => {
  it("mengambil daftar sekolah dan mengadaptasi response", async () => {
    server.use(
      http.get("*/schools", () =>
        HttpResponse.json({
          data: [
            { id: 1, name: "SMA Negeri 1 Bandung" },
            { id: 2, name: "SMA Negeri 2 Bandung" },
          ],
        })
      )
    );

    await expect(listSchools()).resolves.toEqual([
      { id: 1, name: "SMA Negeri 1 Bandung" },
      { id: 2, name: "SMA Negeri 2 Bandung" },
    ]);
  });
});
