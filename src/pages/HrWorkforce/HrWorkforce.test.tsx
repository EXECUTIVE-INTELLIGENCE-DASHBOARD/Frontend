import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HrWorkforce } from "./HrWorkforce";
import {
  absenceLabel,
  allCampusesLabel,
  campuses,
  departments,
  reportingPeriod,
  rowsFor,
  summaryFor,
} from "./hrWorkforce.data";

const chooseCampus = (from: string, to: string) => {
  const campusSelect = screen.getByRole("combobox", {
    name: "Campus",
  });

  expect(campusSelect).toHaveValue(from);
  fireEvent.change(campusSelect, {
    target: { value: to },
  });
};

const cellsOf = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("HrWorkforce", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows the reporting period and the shared campus filter", () => {
    render(<HrWorkforce />);

    expect(screen.getByText(reportingPeriod)).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Campus" })).toHaveValue(
      "All Campuses",
    );
  });

  it("renders the three headline cards for all campuses", () => {
    render(<HrWorkforce />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    const expected: Array<[string, string]> = [
      ["Total Staff", "485"],
      ["Staffing Ratio", "1:1.4"],
      ["Workforce Attendance", "96.4%"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
    });
  });

  it("lists the five departments with their figures", () => {
    render(<HrWorkforce />);

    expect(
      screen.getByRole("heading", {
        name: "Consolidated Workforce Distribution & Attendance Register",
      }),
    ).toBeInTheDocument();

    [
      "Department / Unit",
      "Nature / Staff Category",
      "Location & Campus",
      "Total Headcount",
      "Attendance Rate",
      "Absent Rate",
    ].forEach((name) =>
      expect(screen.getByRole("columnheader", { name })).toBeInTheDocument(),
    );

    // One header row plus five departments.
    expect(screen.getAllByRole("row")).toHaveLength(6);

    expect(
      cellsOf(screen.getByRole("row", { name: /Academic & Curriculum/ })),
    ).toEqual([
      "Academic & Curriculum Instruction",
      "Teaching Staff (Full-Time & Contract)",
      "Kibuli Main & Buwaate",
      "205 Staff",
      "98.0% Present",
      "4 on Leave",
    ]);

    expect(
      cellsOf(screen.getByRole("row", { name: /Administration & Executive/ })),
    ).toEqual([
      "Administration & Executive Support",
      "Administrative & Clerical",
      "Kibuli Main Administrative Block",
      "80 Staff",
      "93.8% Present",
      "7 on Leave/Field",
    ]);

    expect(
      within(screen.getByRole("row", { name: /Transport & Fleet/ })).getByText(
        "1 on Training",
      ),
    ).toBeInTheDocument();
  });

  it("colours attendance green on target and amber below it", () => {
    render(<HrWorkforce />);

    expect(screen.getByText("98.0% Present")).toHaveClass("hw-pill--good");
    expect(screen.getByText("93.8% Present")).toHaveClass("hw-pill--warn");
  });

  it("narrows the table to one department", () => {
    render(<HrWorkforce />);

    fireEvent.change(screen.getByLabelText("Filter department"), {
      target: { value: "Transport & Fleet Management" },
    });

    const table = screen.getByRole("table");

    // The header row and the single department.
    expect(within(table).getAllByRole("row")).toHaveLength(2);
    expect(
      within(table).getByText("Transport & Fleet Management"),
    ).toBeInTheDocument();
    expect(
      within(table).queryByText("Boarding & Catering Operations"),
    ).not.toBeInTheDocument();
  });

  it("changes the figures and rows when a campus is selected", () => {
    render(<HrWorkforce />);

    chooseCampus("All Campuses", "Buwaate Campus");

    const cards = screen.getAllByRole("article");

    expect(within(cards[0]).getByText("100")).toBeInTheDocument();
    expect(within(cards[1]).getByText("1:0.5")).toBeInTheDocument();
    expect(within(cards[2]).getByText("96.0%")).toBeInTheDocument();

    // Header row plus the three departments that work at Buwaate.
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(
      within(screen.getByRole("table")).queryByText(
        "Boarding & Catering Operations",
      ),
    ).not.toBeInTheDocument();

    expect(
      within(screen.getByRole("row", { name: /Transport & Fleet/ })).getByText(
        "No absences",
      ),
    ).toBeInTheDocument();
  });

  it("explains when a department has no staff on the campus", () => {
    render(<HrWorkforce />);

    chooseCampus("All Campuses", "Annex / Preschool Branch");

    fireEvent.change(screen.getByLabelText("Filter department"), {
      target: { value: "Boarding & Catering Operations" },
    });

    expect(
      screen.getByText("No staff are recorded for this selection."),
    ).toBeInTheDocument();
  });

  it("downloads the visible rows when Export Report is clicked", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();

    Object.defineProperty(URL, "createObjectURL", {
      value: createObjectURL,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: revokeObjectURL,
      configurable: true,
      writable: true,
    });

    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    render(<HrWorkforce />);

    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});

describe("hr workforce data", () => {
  it("matches the reference for all campuses", () => {
    const rows = rowsFor(allCampusesLabel);

    expect(rows.map((row) => row.headcount)).toEqual([205, 95, 45, 80, 60]);
    expect(rows.map((row) => row.absent)).toEqual([4, 3, 1, 7, 3]);
    expect(rows.map(absenceLabel)).toEqual([
      "4 on Leave",
      "3 on Leave",
      "1 on Training",
      "7 on Leave/Field",
      "3 on Leave",
    ]);

    expect(summaryFor(allCampusesLabel)).toEqual({
      totalStaff: 485,
      ratio: "1:1.4",
      attendance: 96.4,
    });
  });

  it("adds the campuses up to the all-campuses figures", () => {
    const all = rowsFor(allCampusesLabel);
    const perCampus = campuses.map((campus) => rowsFor(campus.label));

    all.forEach((row) => {
      const parts = perCampus.flatMap((rows) =>
        rows.filter((part) => part.id === row.id),
      );

      expect(parts.reduce((sum, part) => sum + part.headcount, 0)).toBe(
        row.headcount,
      );
      expect(parts.reduce((sum, part) => sum + part.absent, 0)).toBe(
        row.absent,
      );
    });

    expect(
      campuses.reduce(
        (sum, campus) => sum + summaryFor(campus.label).totalStaff,
        0,
      ),
    ).toBe(485);
  });

  it("works out the staffing ratio for each campus", () => {
    expect(summaryFor("Kibuli Main Campus").ratio).toBe("1:1.9");
    expect(summaryFor("Buwaate Campus").ratio).toBe("1:0.5");
    expect(summaryFor("Annex / Preschool Branch").ratio).toBe("1:0.8");
  });

  it("has five departments", () => {
    expect(departments).toHaveLength(5);
  });
});
