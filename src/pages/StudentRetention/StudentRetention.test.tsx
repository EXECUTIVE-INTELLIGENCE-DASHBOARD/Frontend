import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StudentRetention } from "./StudentRetention";
import {
  allCampusesLabel,
  campuses,
  rowsForCampus,
  summaryForCampus,
} from "./studentRetention.data";

const cellsOf = (row: HTMLElement) =>
  within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent);

const chooseCampus = (from: string, to: string) => {
  fireEvent.click(screen.getByRole("button", { name: `Campus: ${from}` }));
  fireEvent.click(within(screen.getByRole("listbox")).getByText(to));
};

describe("StudentRetention", () => {
  it("shows the shared campus filter", () => {
    render(<StudentRetention />);

    expect(
      screen.getByRole("button", { name: "Campus: All Campuses" }),
    ).toBeInTheDocument();
  });

  it("renders the three headline cards for all campuses", () => {
    render(<StudentRetention />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    const expected: Array<[string, string]> = [
      ["Total Re-enrolled Students", "1,200"],
      ["Re-enrollment Rate", "88.5%"],
      ["At-Risk Retention", "150"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
    });
  });

  it("lists retention by nationality", () => {
    render(<StudentRetention />);

    expect(
      screen.getByRole("heading", { name: "Student Retention by Nationality" }),
    ).toBeInTheDocument();

    // One header row plus four nationalities.
    expect(screen.getAllByRole("row")).toHaveLength(5);

    expect(
      cellsOf(screen.getByRole("row", { name: /Ugandan/ })),
    ).toEqual(["Ugandan", "Kibuli", "1,100", "88.0%"]);

    expect(
      cellsOf(screen.getByRole("row", { name: /South Sudanese/ })),
    ).toEqual(["South Sudanese & Other Intl", "Buwaate", "90", "90.0%"]);
  });

  it("highlights rates on target and leaves the others grey", () => {
    render(<StudentRetention />);

    const ugandan = screen.getByRole("row", { name: /Ugandan/ });
    const kenyan = screen.getByRole("row", { name: /Kenyan/ });

    expect(within(ugandan).getByText("88.0%")).toHaveClass("sr-pill--good");
    expect(within(kenyan).getByText("86.7%")).not.toHaveClass("sr-pill--good");
  });

  it("shows retention by gender", () => {
    render(<StudentRetention />);

    const card = screen
      .getByRole("heading", { name: "Retention by Gender" })
      .closest("section") as HTMLElement;

    expect(card).not.toBeNull();

    expect(
      within(card).getByRole("img", { name: "Retention by gender" }),
    ).toBeInTheDocument();

    const girls = within(card).getByText("Girls Retained").closest("li");
    const boys = within(card).getByText("Boys Retained").closest("li");

    expect(girls).toHaveTextContent("720");
    expect(girls).toHaveTextContent("60.0%");
    expect(boys).toHaveTextContent("480");
    expect(boys).toHaveTextContent("40.0%");
  });

  it("changes the figures and rows when a campus is selected", () => {
    render(<StudentRetention />);

    chooseCampus("All Campuses", "Buwaate Campus");

    const cards = screen.getAllByRole("article");

    expect(within(cards[0]).getByText("450")).toBeInTheDocument();
    expect(within(cards[1]).getByText("87.6%")).toBeInTheDocument();
    expect(within(cards[2]).getByText("60")).toBeInTheDocument();

    // Header row plus the three Buwaate nationalities.
    expect(screen.getAllByRole("row")).toHaveLength(4);
    expect(screen.queryByText("Ugandan")).not.toBeInTheDocument();
  });

  it("explains when a campus has no nationality rows", () => {
    render(<StudentRetention />);

    chooseCampus("All Campuses", "Annex / Preschool Branch");

    expect(
      screen.getByText("No nationality data is recorded for this campus yet."),
    ).toBeInTheDocument();
    expect(
      within(screen.getAllByRole("article")[0]).getByText("150"),
    ).toBeInTheDocument();
  });
});

describe("student retention data", () => {
  it("adds the campuses up to the all-campuses figures", () => {
    const all = summaryForCampus(allCampusesLabel);
    const parts = campuses.map((campus) => summaryForCampus(campus.label));

    const sum = (pick: (s: typeof all) => number) =>
      parts.reduce((total, part) => total + pick(part), 0);

    expect(sum((s) => s.reEnrolled)).toBe(all.reEnrolled);
    expect(sum((s) => s.atRisk)).toBe(all.atRisk);
    expect(sum((s) => s.girls)).toBe(all.girls);
    expect(sum((s) => s.boys)).toBe(all.boys);
    expect(all.reEnrolled).toBe(1200);
  });

  it("keeps girls plus boys equal to the re-enrolled total for every campus", () => {
    [allCampusesLabel, ...campuses.map((campus) => campus.label)].forEach(
      (label) => {
        const summary = summaryForCampus(label);

        expect(summary.girls + summary.boys).toBe(summary.reEnrolled);
      },
    );
  });

  it("shows every row for all campuses and filters by campus", () => {
    expect(rowsForCampus(allCampusesLabel)).toHaveLength(4);
    expect(rowsForCampus("Kibuli Main Campus")).toHaveLength(1);
    expect(rowsForCampus("Buwaate Campus")).toHaveLength(3);
    expect(rowsForCampus("Annex / Preschool Branch")).toHaveLength(0);
  });
});
