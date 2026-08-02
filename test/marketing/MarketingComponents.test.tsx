import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  SectionHeading,
  StatBadge,
  TestimonialCard,
} from "@/components/marketing";

describe("marketing components", () => {
  it("renders one semantic section heading with an accented phrase", () => {
    render(
      <SectionHeading
        eyebrow="Mengapa EduQuest"
        title="Belajar dengan"
        accent="cara baru"
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Belajar dengan cara baru",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Mengapa EduQuest")).toBeInTheDocument();
  });

  it("renders a contextual research statistic", () => {
    render(<StatBadge value="75–100" label="target siswa" />);

    expect(screen.getByText("75–100")).toBeInTheDocument();
    expect(screen.getByText("target siswa")).toBeInTheDocument();
  });

  it("labels fictional testimony and exposes its rating", () => {
    render(
      <TestimonialCard
        name="Alya"
        role="Siswa"
        quote="Belajar terasa lebih terarah."
        avatarSrc="https://images.pexels.com/photos/5472898/pexels-photo-5472898.jpeg?auto=compress&cs=tinysrgb&w=200"
      />,
    );

    expect(
      screen.getByText("Ilustrasi pengalaman — placeholder"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Rating ilustratif: 5 dari 5 bintang"),
    ).toBeInTheDocument();
  });
});
