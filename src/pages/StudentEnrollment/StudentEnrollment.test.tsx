import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentEnrollment } from "./StudentEnrollment";

describe("StudentEnrollment", () => {
  it("renders the page heading", () => {
    render(<StudentEnrollment />);

    expect(
      screen.getByRole("heading", { name: "Student Enrollment" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Tracks student numbers, conversions and the capacity needed to support learning\./,
      ),
    ).toBeInTheDocument();
  });

  it("renders the headline enrollment metrics", () => {
    render(<StudentEnrollment />);

    const expectedMetrics: Array<[string, string]> = [
      ["Current Enrollment", "3,420"],
      ["Capacity Used", "97.7%"],
      ["Net Period Change", "+120"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = screen.getByText(label).closest("article");

      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renders the enrollment trend and group comparison cards", () => {
    render(<StudentEnrollment />);

    expect(
      screen.getByRole("heading", { name: /Enrollment Changes Over Time/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Student Group Comparison/i }),
    ).toBeInTheDocument();

    // "AY 2025/2026" also appears in the academic year filter control.
    expect(screen.getAllByText("AY 2025/2026").length).toBeGreaterThan(0);
    expect(screen.getByText("AY 2024/2025")).toBeInTheDocument();
  });

  it("renders the capacity plan and the attention table", () => {
    render(<StudentEnrollment />);

    expect(
      screen.getByRole("heading", {
        name: /Capacity & Resource Planning/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Science lead")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Enrollment Changes Requiring Attention/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Arts intake")).toBeInTheDocument();
    expect(screen.getByText("Next intake")).toBeInTheDocument();
  });
});
