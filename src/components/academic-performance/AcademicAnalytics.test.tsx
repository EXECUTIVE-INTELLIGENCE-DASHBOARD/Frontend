import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { AcademicAnalytics } from "./AcademicAnalytics";

describe("AcademicAnalytics", () => {
  it("renders the academic analytics section", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByRole("region", {
        name: "Academic analytics",
      }),
    ).toBeInTheDocument();
  });

  it("renders both analytics cards", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByRole("heading", {
        name: "Grade Distribution",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Graduation Rate",
      }),
    ).toBeInTheDocument();
  });

  it("renders the descriptions for both analytics cards", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByText(
        "Breakdown of student grades across academic levels",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Graduation rates by academic level"),
    ).toBeInTheDocument();
  });

  it("renders O Level and A Level grade distributions", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByRole("heading", { name: "O Level" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "A Level" }),
    ).toBeInTheDocument();

    expect(screen.getByText("400 students")).toBeInTheDocument();
    expect(screen.getByText("226 students")).toBeInTheDocument();
  });

  it("renders all O Level and A Level grades", () => {
    render(<AcademicAnalytics />);

    const gradeLabels = screen.getAllByText(/^[A-EUO]$/);

    expect(gradeLabels).toHaveLength(12);

    for (const grade of ["A", "B", "C", "D", "E", "U"]) {
      expect(
        screen.getAllByText(grade).length,
      ).toBeGreaterThanOrEqual(1);
    }

    expect(screen.getAllByText("A").length).toBe(2);
    expect(screen.getAllByText("B").length).toBe(2);
    expect(screen.getAllByText("C").length).toBe(2);
    expect(screen.getAllByText("D").length).toBe(2);
    expect(screen.getAllByText("E").length).toBe(2);
  });

  it("renders the correct grade student counts", () => {
    render(<AcademicAnalytics />);

    for (const count of [
      "42",
      "86",
      "124",
      "98",
      "38",
      "12",
      "28",
      "56",
      "74",
      "18",
      "8",
    ]) {
      expect(screen.getAllByText(count).length).toBeGreaterThanOrEqual(1);
    }
  });

  it("renders all grade progress bars with accessible labels", () => {
    render(<AcademicAnalytics />);

    const progressBars = screen.getAllByRole("progressbar");

    const gradeProgressBars = progressBars.filter((bar) =>
      bar.getAttribute("aria-label")?.includes("grade"),
    );

    expect(gradeProgressBars).toHaveLength(12);

    expect(
      screen.getByRole("progressbar", {
        name: "O Level grade A",
      }),
    ).toHaveAttribute("aria-valuenow", "42");

    expect(
      screen.getByRole("progressbar", {
        name: "A Level grade C",
      }),
    ).toHaveAttribute("aria-valuenow", "74");
  });

  it("renders both graduation levels", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByText("O Level", {
        selector: ".acad-analytics__completion-level-label",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("A Level", {
        selector: ".acad-analytics__completion-level-label",
      }),
    ).toBeInTheDocument();
  });

  it("calculates and displays the correct graduation rates", () => {
    render(<AcademicAnalytics />);

    expect(screen.getByText("91.9%")).toBeInTheDocument();
    expect(screen.getByText("90.7%")).toBeInTheDocument();
  });

  it("renders the correct graduated and enrolled student counts", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByText("386 of 420 students"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("205 of 226 students"),
    ).toBeInTheDocument();
  });

  it("renders accessible graduation rate progress bars", () => {
    render(<AcademicAnalytics />);

    expect(
      screen.getByRole("progressbar", {
        name: "O Level graduation rate",
      }),
    ).toHaveAttribute("aria-valuenow", "91.9");

    expect(
      screen.getByRole("progressbar", {
        name: "A Level graduation rate",
      }),
    ).toHaveAttribute("aria-valuenow", "90.7");
  });
});