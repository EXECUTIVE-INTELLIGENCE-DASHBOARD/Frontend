import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AcademicPerformance } from "./AcademicPerformance";

describe("AcademicPerformance", () => {
  it("renders the academic performance page", () => {
    render(<AcademicPerformance />);

    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("renders the academic performance filters", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("region", {
        name: "Academic performance filters",
      }),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Campus")).toBeInTheDocument();
    expect(screen.getByLabelText("Section")).toBeInTheDocument();
    expect(screen.getByLabelText("Term")).toBeInTheDocument();
    expect(screen.getByLabelText("Academic Year")).toBeInTheDocument();
  });

  it("uses the correct default filter selections", () => {
    render(<AcademicPerformance />);

    expect(screen.getByLabelText("Campus")).toHaveValue("All Campuses");
    expect(screen.getByLabelText("Section")).toHaveValue("Secondary");
    expect(screen.getByLabelText("Term")).toHaveValue("Term 1");
    expect(screen.getByLabelText("Academic Year")).toHaveValue(
      String(new Date().getFullYear()),
    );
  });

  it("renders all campus options", () => {
    render(<AcademicPerformance />);

    const campusSelect = screen.getByLabelText("Campus");

    expect(
      within(campusSelect).getByRole("option", {
        name: "All Campuses",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getByRole("option", {
        name: "Kibuli Main Campus",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getByRole("option", {
        name: "Buwaate Campus",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getByRole("option", {
        name: "Annex Preschool",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getByRole("option", {
        name: "Secondary Campus",
      }),
    ).toBeInTheDocument();

    expect(
      within(campusSelect).getByRole("option", {
        name: "Primary Campus",
      }),
    ).toBeInTheDocument();

    expect(within(campusSelect).getAllByRole("option")).toHaveLength(6);
  });

  it("renders all section options", () => {
    render(<AcademicPerformance />);

    const sectionSelect = screen.getByLabelText("Section");

    expect(within(sectionSelect).getAllByRole("option")).toHaveLength(3);

    expect(
      within(sectionSelect).getByRole("option", {
        name: "Nursery",
      }),
    ).toBeInTheDocument();

    expect(
      within(sectionSelect).getByRole("option", {
        name: "Primary",
      }),
    ).toBeInTheDocument();

    expect(
      within(sectionSelect).getByRole("option", {
        name: "Secondary",
      }),
    ).toBeInTheDocument();
  });

  it("renders all term options", () => {
    render(<AcademicPerformance />);

    const termSelect = screen.getByLabelText("Term");

    expect(within(termSelect).getAllByRole("option")).toHaveLength(3);

    expect(
      within(termSelect).getByRole("option", {
        name: "Term 1",
      }),
    ).toBeInTheDocument();

    expect(
      within(termSelect).getByRole("option", {
        name: "Term 2",
      }),
    ).toBeInTheDocument();

    expect(
      within(termSelect).getByRole("option", {
        name: "Term 3",
      }),
    ).toBeInTheDocument();
  });

  it("renders five academic year options starting from the current year", () => {
    render(<AcademicPerformance />);

    const yearSelect = screen.getByLabelText("Academic Year");
    const currentYear = new Date().getFullYear();

    expect(within(yearSelect).getAllByRole("option")).toHaveLength(5);

    for (let index = 0; index < 5; index += 1) {
      expect(
        within(yearSelect).getByRole("option", {
          name: String(currentYear - index),
        }),
      ).toBeInTheDocument();
    }
  });

  it("allows the user to change the campus", async () => {
    const user = userEvent.setup();

    render(<AcademicPerformance />);

    const campusSelect = screen.getByLabelText("Campus");

    await user.selectOptions(campusSelect, "Kibuli Main Campus");

    expect(campusSelect).toHaveValue("Kibuli Main Campus");
  });

  it("allows the user to change the section", async () => {
    const user = userEvent.setup();

    render(<AcademicPerformance />);

    const sectionSelect = screen.getByLabelText("Section");

    await user.selectOptions(sectionSelect, "Primary");

    expect(sectionSelect).toHaveValue("Primary");
  });

  it("allows the user to change the term", async () => {
    const user = userEvent.setup();

    render(<AcademicPerformance />);

    const termSelect = screen.getByLabelText("Term");

    await user.selectOptions(termSelect, "Term 2");

    expect(termSelect).toHaveValue("Term 2");
  });

  it("allows the user to change the academic year", async () => {
    const user = userEvent.setup();

    render(<AcademicPerformance />);

    const yearSelect = screen.getByLabelText("Academic Year");
    const previousYear = String(new Date().getFullYear() - 1);

    await user.selectOptions(yearSelect, previousYear);

    expect(yearSelect).toHaveValue(previousYear);
  });

  it("renders the academic summary component", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("region", {
        name: "Academic performance summary",
      }),
    ).toBeInTheDocument();
  });

  it("renders the academic analytics component", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("region", {
        name: "Academic analytics",
      }),
    ).toBeInTheDocument();
  });

  it("renders the academic details component", () => {
    render(<AcademicPerformance />);

    expect(
      screen.getByRole("region", {
        name: "Subject comparison and test results",
      }),
    ).toBeInTheDocument();
  });
});
