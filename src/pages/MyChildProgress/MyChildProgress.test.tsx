import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MyChildProgress } from "./MyChildProgress";

describe("MyChildProgress", () => {
  it("renders the page heading", () => {
    render(<MyChildProgress />);

    expect(
      screen.getByRole("heading", { name: "My Child's Progress" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Your child.s attendance, results and support — together in one parent view\./,
      ),
    ).toBeInTheDocument();
  });

  it("renders the headline child metrics", () => {
    render(<MyChildProgress />);

    const expectedMetrics: Array<[string, string]> = [
      ["Child Attendance", "96.7%"],
      ["Average Result", "85%"],
      ["Support Needs", "1"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = screen.getByText(label).closest("article");

      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renders the progress chart and the attendance card", () => {
    render(<MyChildProgress />);

    expect(
      screen.getByRole("heading", { name: /Reporting Period Progress/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Attendance & Follow-up/i }),
    ).toBeInTheDocument();

    // "Term 1" also appears in the trend chart axis, so allow duplicates.
    expect(screen.getAllByText("Term 1").length).toBeGreaterThan(0);

    expect(screen.getByText("All subjects")).toBeInTheDocument();
    expect(screen.getByText("Missed Days")).toBeInTheDocument();
  });

  it("renders the subject results and the follow-up cards", () => {
    render(<MyChildProgress />);

    expect(
      screen.getByRole("heading", {
        name: /Subject Results & Teacher Feedback/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Flagged Support Need/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Parent Engagement & Follow-up/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Mathematics")).toBeInTheDocument();
    expect(screen.getByText("+7 pts")).toBeInTheDocument();
    expect(screen.getByText("Keep practising")).toBeInTheDocument();
  });
});
