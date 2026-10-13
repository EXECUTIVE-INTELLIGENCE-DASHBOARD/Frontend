import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CoCurricularActivities } from "./CoCurricularActivities";
import {
  allCampusesLabel,
  campuses,
  rowsForCampus,
} from "./coCurricularActivities.data";
import { buildCsv, csvFileName } from "./exportCsv";

const cellsOf = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

describe("CoCurricularActivities", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the page heading", () => {
    render(<CoCurricularActivities />);

    expect(
      screen.getByRole("heading", {
        name: "Co-Curricular Activities",
        level: 1,
      }),
    ).toBeInTheDocument();
  });

  it("renders the three headline cards for all campuses", () => {
    render(<CoCurricularActivities />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    const expected: Array<[string, string]> = [
      ["Club Coverage Rate", "94.2%"],
      ["Events & Competitions Held", "57 Events"],
      ["Non-Participating Pool", "170 Students"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
      expect(
        within(cards[index]).getByRole("progressbar", { name: label }),
      ).toBeInTheDocument();
    });
  });

  it("lists the five clubs with their figures", () => {
    render(<CoCurricularActivities />);

    expect(
      screen.getByRole("heading", {
        name: /Co-Curricular & Club Engagement Summary/i,
      }),
    ).toBeInTheDocument();

    const row = screen.getByRole("row", {
      name: /Model United Nations & Debate/,
    });

    expect(cellsOf(row)).toEqual([
      "Model United Nations & Debate",
      "Humanities & Diplomacy",
      "14",
      "300",
      "180",
      "120",
      "25",
    ]);

    // One header row plus five clubs.
    expect(screen.getAllByRole("row")).toHaveLength(6);
  });

  it("changes the figures when a campus is selected", () => {
    render(<CoCurricularActivities />);

    const campus = screen.getByLabelText("Select Campus");

    expect(campus).toHaveValue(allCampusesLabel);

    fireEvent.change(campus, { target: { value: "Kibuli Main Campus" } });

    const cards = screen.getAllByRole("article");

    expect(within(cards[0]).getByText("95.1%")).toBeInTheDocument();
    expect(within(cards[1]).getByText("28 Events")).toBeInTheDocument();
    expect(within(cards[2]).getByText("85 Students")).toBeInTheDocument();

    const row = screen.getByRole("row", {
      name: /Model United Nations & Debate/,
    });

    expect(cellsOf(row)).toEqual([
      "Model United Nations & Debate",
      "Humanities & Diplomacy",
      "7",
      "150",
      "90",
      "60",
      "12",
    ]);

    fireEvent.change(campus, { target: { value: allCampusesLabel } });

    expect(
      within(screen.getAllByRole("article")[0]).getByText("94.2%"),
    ).toBeInTheDocument();
  });

  it("filters the table by domain", () => {
    render(<CoCurricularActivities />);

    fireEvent.change(screen.getByLabelText("Filter domain"), {
      target: { value: "Sports Federation" },
    });

    // The header row and the single Sports Federation club.
    expect(screen.getAllByRole("row")).toHaveLength(2);
    expect(screen.getByText("Track & Field Athletics")).toBeInTheDocument();
    expect(
      screen.queryByText("Model United Nations & Debate"),
    ).not.toBeInTheDocument();
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

    render(<CoCurricularActivities />);

    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});

describe("co-curricular data", () => {
  it("adds the three campuses up to the all-campuses figures", () => {
    const all = rowsForCampus(allCampusesLabel);
    const perCampus = campuses.map((campus) => rowsForCampus(campus.label));

    all.forEach((row, index) => {
      const sum = (pick: (r: typeof row) => number) =>
        perCampus.reduce((total, rows) => total + pick(rows[index]), 0);

      expect(sum((r) => r.events)).toBe(row.events);
      expect(sum((r) => r.girls)).toBe(row.girls);
      expect(sum((r) => r.boys)).toBe(row.boys);
      expect(sum((r) => r.nonParticipatory)).toBe(row.nonParticipatory);
    });

    expect(all.reduce((total, row) => total + row.attended, 0)).toBe(1200);
    expect(all.reduce((total, row) => total + row.nonParticipatory, 0)).toBe(
      170,
    );
  });
});

describe("buildCsv", () => {
  it("writes a header and one line per row", () => {
    const rows = rowsForCampus(allCampusesLabel);
    const lines = buildCsv(rows).split("\r\n");

    expect(lines).toHaveLength(6);
    expect(lines[0]).toBe(
      "Activity / Club,Society,Events held,Total attended,Girls attended,Boys attended,Non participatory",
    );
    expect(lines[1]).toBe(
      "Model United Nations & Debate,Humanities & Diplomacy,14,300,180,120,25",
    );
  });

  it("quotes cells that contain commas or quotes", () => {
    const [row] = rowsForCampus(allCampusesLabel);

    const csv = buildCsv([{ ...row, name: 'Debate, "Open"' }]);

    expect(csv).toContain('"Debate, ""Open"""');
  });

  it("builds a file name from the campus", () => {
    expect(csvFileName("Annex / Preschool Branch")).toBe(
      "co-curricular-engagement-annex-preschool-branch.csv",
    );
  });
});
