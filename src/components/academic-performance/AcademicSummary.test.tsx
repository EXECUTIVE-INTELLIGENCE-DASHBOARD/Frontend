import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { AcademicSummary } from "./AcademicSummary";

describe("AcademicSummary", () => {
  it("renders the academic performance summary section", () => {
    render(<AcademicSummary />);

    expect(
      screen.getByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();
  });

  it("renders all three summary metric cards", () => {
    render(<AcademicSummary />);

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    expect(
      within(summary).getByText("Syllabus Coverage"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Student Performance"),
    ).toBeInTheDocument();

    expect(
      within(summary).getByText("Average Grade"),
    ).toBeInTheDocument();
  });

  it("displays the correct syllabus coverage value and detail", () => {
    render(<AcademicSummary />);

    expect(screen.getByText("78%")).toBeInTheDocument();
    expect(
      screen.getByText("156 of 200 topics covered"),
    ).toBeInTheDocument();
  });

  it("displays the correct student performance value and detail", () => {
    render(<AcademicSummary />);

    expect(screen.getByText("82.4%")).toBeInTheDocument();
    expect(
      screen.getByText("824 of 1,000 students assessed"),
    ).toBeInTheDocument();
  });

  it("displays the average grade and its description", () => {
    render(<AcademicSummary />);

    expect(screen.getByRole("heading", { name: "B" })).toBeInTheDocument();

    expect(
      screen.getByText("Based on recorded assessments"),
    ).toBeInTheDocument();
  });

  it("renders exactly three metric cards", () => {
    render(<AcademicSummary />);

    const summary = screen.getByRole("region", {
      name: "Academic performance summary",
    });

    expect(
      within(summary).getAllByRole("article"),
    ).toHaveLength(3);
  });

  it("keeps the decorative icons hidden from assistive technology", () => {
    const { container } = render(<AcademicSummary />);

    const icons = container.querySelectorAll(
      ".acad-metric__icon[aria-hidden='true']",
    );

    expect(icons).toHaveLength(3);
  });
});