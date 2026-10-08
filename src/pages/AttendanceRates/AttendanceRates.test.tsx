import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttendanceRates } from "./AttendanceRates";

describe("AttendanceRates", () => {
  it("renders the page heading", () => {
    render(<AttendanceRates />);

    expect(
      screen.getByRole("heading", { name: "Attendance Rates" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Monitor student attendance and identify classes and learners needing follow-up\./,
      ),
    ).toBeInTheDocument();
  });

  it("renders the headline attendance metrics", () => {
    render(<AttendanceRates />);

    const expectedMetrics: Array<[string, string]> = [
      ["Attendance Rate", "96.5%"],
      ["Learners to Follow Up", "24"],
      ["Declining Classes", "3"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = screen.getByText(label).closest("article");

      expect(card).not.toBeNull();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renders the trend and student group charts", () => {
    render(<AttendanceRates />);

    expect(
      screen.getByRole("heading", { name: /Attendance Trend Comparison/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Attendance by Student Group/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: /Weekly attendance rate compared with target/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the comparison and intervention tables", () => {
    render(<AttendanceRates />);

    expect(
      screen.getByRole("heading", { name: /Student Group Comparison/i }),
    ).toBeInTheDocument();

    expect(screen.getByText("Day Scholars")).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Declining Attendance & Intervention Queue/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Overdue")).toBeInTheDocument();
  });

  it("lets the user change a filter", () => {
    render(<AttendanceRates />);

    const campus = screen.getByLabelText("Select Campus");

    expect(campus).toHaveValue("All Campuses");

    fireEvent.change(campus, { target: { value: "Greenhill North" } });

    expect(campus).toHaveValue("Greenhill North");
  });
});
