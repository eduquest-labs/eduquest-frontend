import { render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import MarketingPage from "@/app/(marketing)/page";

beforeAll(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    class IntersectionObserverStub {
      disconnect() {}
      observe() {}
      takeRecords() {
        return [];
      }
      unobserve() {}
    },
  );
});

afterAll(() => vi.unstubAllGlobals());

describe("MarketingPage", () => {
  it("renders the complete Indonesian marketing journey", () => {
    render(<MarketingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /Tetap Semangat Belajar Bersama EduQuest/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute(
      "href",
      "/login",
    );
    expect(
      screen.getByRole("link", { name: "Aktivasi Akun" }),
    ).toHaveAttribute("href", "/claim");
    expect(
      screen.getByRole("link", { name: "Mulai Petualangan" }),
    ).toHaveAttribute("href", "/claim");
    expect(screen.getByText("75–100")).toBeInTheDocument();
    expect(screen.getByText("target siswa")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("sekolah sasaran")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("peneliti")).toBeInTheDocument();
    expect(
      screen.getAllByText("Ilustrasi pengalaman — placeholder"),
    ).toHaveLength(3);
    expect(
      screen.getByRole("heading", {
        name: "Bergabung dengan Program EduQuest",
      }),
    ).toBeInTheDocument();
  });
});
