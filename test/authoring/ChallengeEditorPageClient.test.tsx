import { http, HttpResponse } from "msw";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ChallengeEditorPageClient } from "@/components/authoring";
import { renderWithProviders } from "@/test/helpers/render";
import { server } from "@/test/msw/server";

describe("ChallengeEditorPageClient", () => {
  it("memulihkan context kelas-topic-challenge dari API saat cache kosong", async () => {
    server.use(
      http.get("*/classes/1", () => HttpResponse.json({ id: 1, name: "Kelas A", class_code: "ABC123", student_count: 20, created_at: "a" })),
      http.get("*/classes/1/topics", () => HttpResponse.json({ data: [{ id: 2, class_id: 1, name: "Minggu 1", sort_order: 0, created_at: "a", updated_at: "a" }] })),
      http.get("*/topics/2/challenges", () => HttpResponse.json({ data: [{
        id: 3, topic_id: 2, title: "Kuis Kebugaran", description: "Evaluasi", type: "kuis",
        points_reward: 100, start_time: null, end_time: null, timer_seconds: 600,
        is_published: false, availability_status: "draft", created_at: "a", updated_at: "a",
      }] })),
      http.get("*/challenges/3/questions", () => HttpResponse.json({ data: [{
        id: 4, challenge_id: 3, question_type: "esai", question_text: "Jelaskan manfaat pemanasan",
        points: 20, sort_order: 0, time_limit_seconds: null, correct_answer_text: null,
        options: [], created_at: "a", updated_at: "a",
      }] }))
    );

    renderWithProviders(<ChallengeEditorPageClient classId={1} topicId={2} challengeId={3} />);

    expect(await screen.findByRole("heading", { name: "Kuis Kebugaran" })).toBeInTheDocument();
    expect(screen.getByText("Kelas A / Minggu 1")).toBeInTheDocument();
    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText("Jelaskan manfaat pemanasan")).toBeInTheDocument();
  });
});
