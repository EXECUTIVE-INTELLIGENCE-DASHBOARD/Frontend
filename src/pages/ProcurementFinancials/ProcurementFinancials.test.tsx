import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProcurementFinancials } from "./ProcurementFinancials";
import { allVendors, vendorsTotalSpend } from "./procurementFinancials.data";

describe("ProcurementFinancials", () => {
  it("renders the campus filter", () => {
    render(<ProcurementFinancials />);

    expect(screen.getByLabelText("Select Campus")).toBeInTheDocument();
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

describe("all vendors dialog", () => {
  const openDialog = () => {
    render(<ProcurementFinancials />);

    const trigger = screen.getByRole("button", {
      name: /View All 34 Vendors/i,
    });

    fireEvent.click(trigger);

    return trigger;
  };

  it("is closed until View All Vendors is clicked", () => {
    render(<ProcurementFinancials />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("lists all 34 vendors and their total", () => {
    openDialog();

    const dialog = screen.getByRole("dialog", { name: "All 34 Vendors" });

    // One header row plus 34 vendors.
    expect(within(dialog).getAllByRole("row")).toHaveLength(35);
    expect(
      within(dialog).getByText("Scholastic Publishers Ltd"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText("Wakiso Garden Services"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/34 vendors · UGX 480\.0M total spend/),
    ).toBeInTheDocument();
  });

  it("closes with Escape and returns focus to the button", () => {
    const trigger = openDialog();

    expect(
      screen.getByRole("button", { name: "Close vendor list" }),
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("closes with the close button", () => {
    openDialog();

    fireEvent.click(screen.getByRole("button", { name: "Close vendor list" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked, but not when the panel is", () => {
    openDialog();

    fireEvent.click(screen.getByRole("dialog"));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("vendors-backdrop"));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("vendor data", () => {
  it("has 34 vendors that add up to the UGX 480.0M outflow", () => {
    expect(allVendors).toHaveLength(34);
    expect(vendorsTotalSpend).toBeCloseTo(480, 5);
  });

  it("ranks vendors from highest to lowest spend", () => {
    allVendors.forEach((vendor, index) => {
      expect(vendor.rank).toBe(index + 1);

      if (index > 0) {
        expect(vendor.spend).toBeLessThanOrEqual(allVendors[index - 1].spend);
      }
    });
  });
});
