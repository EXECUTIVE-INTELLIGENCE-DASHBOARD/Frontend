import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProcurementFinancials } from "./ProcurementFinancials";

describe("ProcurementFinancials", () => {
  it("renders the page heading", () => {
    render(<ProcurementFinancials />);

    expect(
      screen.getByRole("heading", { name: "Procurement Financials", level: 1 }),
    ).toBeInTheDocument();
  });

  it("renders the three spend category cards", () => {
    render(<ProcurementFinancials />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    const expected: Array<[string, string]> = [
      ["Works (Capital)", "UGX 180.0M"],
      ["Services (Operations)", "UGX 145.0M"],
      ["Goods", "UGX 155.0M"],
    ];

    expected.forEach(([label, value], index) => {
      expect(within(cards[index]).getByText(label)).toBeInTheDocument();
      expect(within(cards[index]).getByText(value)).toBeInTheDocument();
    });
  });

  it("lists the top five vendors with a link to all vendors", () => {
    render(<ProcurementFinancials />);

    expect(
      screen.getByRole("heading", { name: /Top 5 Vendors by Total Spend/i }),
    ).toBeInTheDocument();

    const vendors = screen.getAllByRole("listitem").filter((item) =>
      item.classList.contains("pf-vendor"),
    );

    expect(vendors).toHaveLength(5);
    expect(screen.getByText("Scholastic Publishers Ltd")).toBeInTheDocument();
    expect(screen.getByText("Vivo Energy (Shell)")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /View All 34 Vendors/i }),
    ).toBeInTheDocument();
  });

  it("shows the spend allocation total and shares", () => {
    render(<ProcurementFinancials />);

    const section = screen
      .getByRole("heading", { name: /Spend Allocation by Category/i })
      .closest("section") as HTMLElement;

    expect(section).not.toBeNull();

    expect(
      within(section).getByRole("img", {
        name: /Spend allocation by category/i,
      }),
    ).toBeInTheDocument();

    expect(
      within(section).getByText(/Total outflow UGX 480\.0M/),
    ).toBeInTheDocument();
    expect(within(section).getByText(/37\.5%/)).toBeInTheDocument();
    expect(within(section).getByText(/32\.3%/)).toBeInTheDocument();
    expect(within(section).getByText(/30\.2%/)).toBeInTheDocument();
  });

  it("renders the settlement and liability analysis chart", () => {
    render(<ProcurementFinancials />);

    expect(
      screen.getByRole("heading", {
        name: /Procurement Settlement & Liability Analysis/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("img", {
        name: /Paid, committed and outstanding amounts/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Outstanding AP (Unpaid)")).toBeInTheDocument();
  });

  it("lets the user change the campus", () => {
    render(<ProcurementFinancials />);

    const campus = screen.getByLabelText("Select Campus");

    expect(campus).toHaveValue("All Campuses");

    fireEvent.change(campus, { target: { value: "Kibuli Main Campus" } });

    expect(campus).toHaveValue("Kibuli Main Campus");
  });
});
