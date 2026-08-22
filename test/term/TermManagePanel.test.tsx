import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { TermManagePanel } from "@/components/term";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { setToken } from "@/services/token-store";

const term = {
  id: 1,
  classId: 1,
  name: "Termin 1",
  sortOrder: 0,
  thresholdPercent: 60,
  releaseAt: null,
  randomizeQuestions: false,
};

describe("TermManagePanel", () => {
  it("shows student progress and allows override", async () => {
    setToken("test-access-token");
    let overrideRequestBody: Record<string, unknown> | null = null;
    server.use(
      http.get("*/terms/1/progress", () =>
        HttpResponse.json({
          data: [{ class_student_id: 3, student_name: "Budi", status: "in_progress", source: "auto", feedback: null }],
        })
      ),
      http.get("*/terms/1/threshold-history", () => HttpResponse.json({ data: [] })),
      http.patch("*/terms/1/students/3/override", async ({ request }) => {
        overrideRequestBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ message: "ok" });
      })
    );

    renderWithProviders(<TermManagePanel classId={1} term={term} />);

    fireEvent.click(screen.getByRole("button", { name: "Kelola Termin" }));
    expect(await screen.findByText("Budi")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Override" }));
    fireEvent.click(await screen.findByRole("button", { name: "Lulus" }));
    fireEvent.click(screen.getByRole("button", { name: "Simpan override" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(overrideRequestBody).toEqual({ status: "passed", feedback: undefined });
  });
});
