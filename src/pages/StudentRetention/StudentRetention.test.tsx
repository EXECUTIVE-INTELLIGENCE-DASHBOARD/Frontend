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
  const campusSelect = screen.getByRole("combobox", {
    name: "Campus",
  });

  expect(campusSelect).toHaveValue(from);

  fireEvent.change(campusSelect, {
    target: { value: to },
  });
};

describe("StudentRetention", () => {
  it("shows the shared campus filter", () => {
    render(<StudentRetention />);

    expect(
      screen.getByRole("combobox", { name: "Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "All Campuses" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Kibuli Main Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Buwaate Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Annex / Preschool Branch",
      }),
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
      screen.getByRole("heading", {
        name: "Student Retention by Nationality",
      }),
    ).toBeInTheDocument();

    // One header row plus four nationalities.
    expect(screen.getAllByRole("row")).toHaveLength(5);

    expect(cellsOf(screen.getByRole("row", { name: /Ugandan/ }))).toEqual([
      "Ugandan",
      "Kibuli",
      "1,100",
      "88.0%",
    ]);

    expect(
      cellsOf(screen.getByRole("row", { name: /South Sudanese/ })),
    ).toEqual([
      "South Sudanese & Other Intl",
      "Buwaate",
      "90",
      "90.0%",
    ]);
  });

  it("highlights rates on target and leaves the others grey", () => {
    render(<StudentRetention />);

    const ugandan = screen.getByRole("row", { name: /Ugandan/ });
    const kenyan = screen.getByRole("row", { name: /Kenyan/ });

    expect(within(ugandan).getByText("88.0%")).toHaveClass("sr-pill--good");
    expect(within(kenyan).getByText("86.7%")).not.toHaveClass(
      "sr-pill--good",
    );
  });

  it("shows the reasons for withdrawal card", () => {
    render(<StudentRetention />);

    const heading = screen.getByRole("heading", {
      name: "Reasons for Withdrawal",
    });

    const card = heading.closest("section");

    expect(card).not.toBeNull();

    const withdrawalCard = card as HTMLElement;

    expect(
      within(withdrawalCard).getByRole("img", {
        name: "Student withdrawals by reason",
      }),
    ).toBeInTheDocument();

    expect(within(withdrawalCard).getByText("124")).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Total Withdrawals"),
    ).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Financial Constraints"),
    ).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Transfer to Another School"),
    ).toBeInTheDocument();

    expect(within(withdrawalCard).getByText("Death")).toBeInTheDocument();

    expect(
      within(withdrawalCard).getByText("Academic Performance"),
    ).toBeInTheDocument();
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

    expect(
      screen.getByRole("combobox", { name: "Campus" }),
    ).toHaveValue("Buwaate Campus");
  });

  it("explains when a campus has no nationality rows", () => {
    render(<StudentRetention />);

    chooseCampus("All Campuses", "Annex / Preschool Branch");

    expect(
      screen.getByText(
        "No nationality data is recorded for this campus yet.",
      ),
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