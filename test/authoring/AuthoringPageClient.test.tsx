import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthoringPageClient } from "@/components/authoring/AuthoringPageClient";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { clearToken, setToken } from "@/services/token-store";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe("AuthoringPageClient", () => {
  beforeEach(() => setToken("test-access-token"));
  afterEach(clearToken);

  it("groups topics under their term as a TermSection", async () => {
    server.use(
      http.get("*/classes", () =>
        HttpResponse.json({ data: [{ id: 1, dosenId: 1, name: "Kelas A", classCode: "AAA", createdAt: "a", updatedAt: "a" }] })
      ),
      http.get("*/classes/1/terms", () =>
        HttpResponse.json({
          data: [{ id: 1, class_id: 1, name: "Termin 1", sort_order: 0, threshold_percent: "60.00", release_at: null, randomize_questions: false }],
        })
      ),
      http.get("*/classes/1/topics", () =>
        HttpResponse.json({
          data: [{ id: 1, class_id: 1, term_id: 1, name: "Topic A", sort_order: 0, created_at: "a", updated_at: "a" }],
        })
      )
    );

    renderWithProviders(<AuthoringPageClient initialClassId={1} />);

    expect(await screen.findByText("Termin 1")).toBeInTheDocument();
  });

  it("shows topics without a term under an ungrouped section", async () => {
    server.use(
      http.get("*/classes", () =>
        HttpResponse.json({ data: [{ id: 1, dosenId: 1, name: "Kelas A", classCode: "AAA", createdAt: "a", updatedAt: "a" }] })
      ),
      http.get("*/classes/1/terms", () => HttpResponse.json({ data: [] })),
      http.get("*/classes/1/topics", () =>
        HttpResponse.json({
          data: [{ id: 2, class_id: 1, term_id: null, name: "Topic B", sort_order: 0, created_at: "a", updated_at: "a" }],
        })
      )
    );

    renderWithProviders(<AuthoringPageClient initialClassId={1} />);

    expect(await screen.findByText("Topic tanpa termin")).toBeInTheDocument();
  });
});
