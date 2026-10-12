import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AcademicPerformance } from "./AcademicPerformance";

describe("AcademicPerformance", () => {
  it("renders the page heading", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("heading", { name: "Academic Performance" }),
    ).toBeInTheDocument();
  });

  it("renders the headline metrics", () => {
    render(<AcademicPerformance />);

    const expectedMetrics: Array<[string, string]> = [
      ["Academic Pass Rate", "88.5%"],
      ["Student Retention", "96.2%"],
      ["Completion Rate", "92.0%"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = screen.getByText(label).closest("article");

      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renders the support roster and priority signals", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("heading", {
        name: /Early Intervention & Student Support Roster/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Ava R.")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Subject Performance & Priority Signals/i,
      }),
    ).toBeInTheDocument();
  });
});
