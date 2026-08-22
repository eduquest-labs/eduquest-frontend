import { fireEvent, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { ChallengeGroupManager } from "@/components/term";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";
import { setToken } from "@/services/token-store";

describe("ChallengeGroupManager", () => {
  it("lists existing groups with their members and score", async () => {
    setToken("test-access-token");
    server.use(
      http.get("*/challenges/5/groups", () =>
        HttpResponse.json({
          data: [
            { id: 1, challenge_id: 5, name: "Kelompok A", group_score: "85.00", graded_at: "2026-08-22T10:00:00+07:00", members: [{ class_student_id: 3, student_name: "Budi" }] },
          ],
        })
      ),
      http.get("*/classes/1/students", () => HttpResponse.json({ data: [] }))
    );

    renderWithProviders(<ChallengeGroupManager challengeId={5} classId={1} />);

    expect(await screen.findByText("Kelompok A")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("grades an ungraded group without touching any attempt endpoint", async () => {
    setToken("test-access-token");
    let attemptRequestMade = false;
    let gradeBody: Record<string, unknown> | null = null;

    server.use(
      http.get("*/challenges/5/groups", () =>
        HttpResponse.json({
          data: [{ id: 1, challenge_id: 5, name: "Kelompok A", group_score: null, graded_at: null, members: [{ class_student_id: 3, student_name: "Budi" }] }],
        })
      ),
      http.get("*/classes/1/students", () => HttpResponse.json({ data: [] })),
      http.patch("*/challenge-groups/1/grade", async ({ request }) => {
        gradeBody = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          id: 1,
          challenge_id: 5,
          name: "Kelompok A",
          group_score: "85.00",
          graded_at: "2026-08-22T10:00:00+07:00",
          members: [{ class_student_id: 3, student_name: "Budi" }],
        });
      }),
      http.all("*/attempts*", () => {
        attemptRequestMade = true;
        return HttpResponse.json({});
      })
    );

    renderWithProviders(<ChallengeGroupManager challengeId={5} classId={1} />);

    await screen.findByText("Kelompok A");
    fireEvent.change(screen.getByPlaceholderText("0-100"), { target: { value: "85" } });
    fireEvent.click(screen.getByRole("button", { name: "Nilai" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(gradeBody).toEqual({ group_score: 85 });
    expect(attemptRequestMade).toBe(false);
  });

  it("deletes a group after confirming in the alert dialog", async () => {
    setToken("test-access-token");
    let deleteRequestMade = false;

    server.use(
      http.get("*/challenges/5/groups", () =>
        HttpResponse.json({
          data: [
            { id: 1, challenge_id: 5, name: "Kelompok A", group_score: "85.00", graded_at: "2026-08-22T10:00:00+07:00", members: [{ class_student_id: 3, student_name: "Budi" }] },
          ],
        })
      ),
      http.get("*/classes/1/students", () => HttpResponse.json({ data: [] })),
      http.delete("*/challenge-groups/1", () => {
        deleteRequestMade = true;
        return new HttpResponse(null, { status: 204 });
      })
    );

    renderWithProviders(<ChallengeGroupManager challengeId={5} classId={1} />);

    await screen.findByText("Kelompok A");
    fireEvent.click(screen.getByRole("button", { name: "Hapus kelompok" }));
    fireEvent.click(await screen.findByRole("button", { name: "Hapus" }));

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(deleteRequestMade).toBe(true);
  });

  it("keeps the create-group submit button disabled until a member is selected", async () => {
    setToken("test-access-token");
    server.use(
      http.get("*/challenges/5/groups", () => HttpResponse.json({ data: [] })),
      http.get("*/classes/1/students", () =>
        HttpResponse.json({ data: [{ id: 3, studentId: 30, name: "Budi", nisn: "123", jenisKelamin: "L", isClaimed: true, joinedAt: null }] })
      )
    );

    renderWithProviders(<ChallengeGroupManager challengeId={5} classId={1} />);

    fireEvent.click(await screen.findByRole("button", { name: "Buat Kelompok" }));
    fireEvent.change(screen.getByLabelText("Nama kelompok"), { target: { value: "Kelompok A" } });
    await screen.findByText("Budi");

    const submitButtons = screen.getAllByRole("button", { name: "Buat Kelompok" });
    expect(submitButtons[submitButtons.length - 1]).toBeDisabled();
  });
});
