import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RevenueDetails } from "./RevenueDetails";

describe("RevenueDetails", () => {
  it("renders all three summary cards with the correct amounts", () => {
    render(<RevenueDetails />);

    expect(
      screen.getByText("EXPECTED BILLED REVENUE"),
    ).toBeInTheDocument();

    expect(
      screen.getAllByText("UGX 850.0M"),
    ).toHaveLength(2);

    expect(
      screen.getByText("REALIZED COLLECTIONS"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("UGX 620.5M"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("OUTSTANDING ARREARS"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("UGX 229.5M"),
    ).toBeInTheDocument();
  });

  it("renders the campus revenue table with the correct campuses", () => {
    render(<RevenueDetails />);

    const table = screen.getByRole("table");

    expect(table).toBeInTheDocument();

    expect(
      within(table).getByText("Kibuli Main Campus"),
    ).toBeInTheDocument();

    expect(
      within(table).getByText("Buwaate Campus"),
    ).toBeInTheDocument();

    expect(
      within(table).getByText("Annex / Preschool Branch"),
    ).toBeInTheDocument();
  });

  it("renders the correct campus collection percentages", () => {
    render(<RevenueDetails />);

    const table = within(screen.getByRole("table"));

    expect(table.getByText("80.0%")).toBeInTheDocument();
    expect(table.getByText("64.8%")).toBeInTheDocument();
    expect(table.getByText("60.0%")).toBeInTheDocument();
  });

  it("renders all six revenue streams", () => {
    render(<RevenueDetails />);

    expect(screen.getByText("Tuition")).toBeInTheDocument();

    expect(
      screen.getByText("Extracurricular & Clubs"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Admission & Registration"),
    ).toBeInTheDocument();

    expect(screen.getByText("Minimart")).toBeInTheDocument();

    expect(screen.getByText("Donations")).toBeInTheDocument();

    expect(
      screen.getByText("Alumni Contributions"),
    ).toBeInTheDocument();
  });

  it("renders the correct revenue stream progress values", () => {
    render(<RevenueDetails />);

    expect(
      screen.getByRole("progressbar", {
        name: "Tuition contribution",
      }),
    ).toHaveAttribute("aria-valuenow", "76.5");

    expect(
      screen.getByRole("progressbar", {
        name: "Minimart contribution",
      }),
    ).toHaveAttribute("aria-valuenow", "10");
  });
});