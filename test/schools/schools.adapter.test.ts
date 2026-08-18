import { describe, expect, it } from "vitest";

import { adaptSchool } from "@/services/adapters";

describe("schools adapter", () => {
  it("mengubah response sekolah snake_case menjadi camelCase", () => {
    expect(adaptSchool({ id: 3, name: "SMA Negeri 1 Bandung" })).toEqual({
      id: 3,
      name: "SMA Negeri 1 Bandung",
    });
  });
});
