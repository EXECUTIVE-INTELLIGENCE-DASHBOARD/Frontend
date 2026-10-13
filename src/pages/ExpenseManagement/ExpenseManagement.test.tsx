/**
 * Tests for the Expense Management page.
 *
 * Two things shape how these tests are written:
 *
 * 1. **The same figure appears in several places on purpose.** "UGX 540.0M" is
 *    the Total YTD KPI card, the donut's centre label is "UGX 540M", and the
 *    four legend rows are the parts of it. The page is *supposed* to repeat
 *    itself — that is how a reader cross-checks the cuts of the data — so an
 *    unscoped `screen.getByText` would be ambiguous. Every value assertion
 *    below is therefore scoped with `within(...)` to the card, row or section
 *    it belongs to.
 *
 * 2. **The strings are hard-coded, not imported from the data module.** Pulling
 *    the expected figures from `expenseManagement.data.ts` would mean the test
 *    agreed with whatever the module happened to say, including a wrong number.
 *    Typing the values out means a change to the sample data has to be a
 *    deliberate change to this file too.
 */
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExpenseManagement } from "./ExpenseManagement";

/** Locates the `<section>` card that owns a given card heading. */
function cardFor(heading: string): HTMLElement {
  return screen
    .getByRole("heading", { name: heading })
    .closest("section") as HTMLElement;
}

describe("ExpenseManagement", () => {
  it("renders the page heading and breadcrumb", () => {
    render(<ExpenseManagement />);

    expect(
      screen.getByRole("heading", { name: "Expense Management", level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Operating and capital expenditure across departments/i),
    ).toBeInTheDocument();

    // Scoped to the breadcrumb: the current crumb repeats the page title, so a
    // document-wide query for "Expense Management" would match the h1 as well.
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(
      within(breadcrumb).getByText("Finance & Procurement"),
    ).toBeInTheDocument();
    expect(
      within(breadcrumb).getByText("Expense Management"),
    ).toBeInTheDocument();
  });

  it("offers a refresh action", () => {
    render(<ExpenseManagement />);

    expect(
      screen.getByRole("button", { name: "Refresh expense data" }),
    ).toBeInTheDocument();
  });

  it("does not render its own <main> element", () => {
    // `App.tsx` already wraps every page in `<main>`, so a nested one here
    // would be invalid HTML. The page root is deliberately a plain <div>.
    const { container } = render(<ExpenseManagement />);

    expect(container.querySelector("main")).toBeNull();
  });

  it("renders the three headline KPI cards", () => {
    render(<ExpenseManagement />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(3);

    // [label, figure] in the order `summaryMetrics` declares them, which is
    // the render order across the row.
    const expected: Array<[string, string]> = [
      ["Total YTD Expenditure", "UGX 540.0M"],
      ["Campus Operational Spend", "UGX 380.0M"],
      ["Pending Expense Approvals", "UGX 65.5M"],
    ];

    expected.forEach(([label, amount], index) => {
      const card = cards[index];

      expect(within(card).getByText(label)).toBeInTheDocument();
      expect(within(card).getByText(amount)).toBeInTheDocument();
    });
  });

  it("renders the single campus filter with its default", () => {
    render(<ExpenseManagement />);

    // The visible layer is a styled span, so the select is what carries the
    // accessible label. The default is always the "All ..." option.
    expect(screen.getByLabelText("Campus")).toHaveValue("All Campuses");

    // Campus is the only cut the page offers.
    const rail = document.querySelector(".exp-filters") as HTMLElement;

    expect(rail.querySelectorAll(".exp-filter")).toHaveLength(1);
  });

  it("updates the filter's visible value when another option is picked", () => {
    render(<ExpenseManagement />);

    const campus = screen.getByLabelText("Campus");
    const option = campus.querySelector("option:nth-child(2)") as HTMLOptionElement;

    fireEvent.change(campus, { target: { value: option.value } });

    expect(campus).toHaveValue(option.value);

    // The value the user actually sees is the aria-hidden span drawn under the
    // invisible select, so it has to be checked separately.
    const filter = campus.closest(".exp-filter") as HTMLElement;

    expect(filter).toHaveTextContent(option.value);
  });

  it("renders the expense distribution donut and its legend", () => {
    render(<ExpenseManagement />);

    const card = cardFor("Expense Distribution");

    expect(
      within(card).getByRole("img", {
        name: "Operating expenses split by category",
      }),
    ).toBeInTheDocument();

    // Centre of the ring: the same total the "Total YTD Expenditure" KPI shows.
    expect(within(card).getByText("UGX 540M")).toBeInTheDocument();
    expect(within(card).getByText("Total OpEx")).toBeInTheDocument();

    // The legend lists the same four categories the ring is cut into, largest
    // first.
    const names = within(card)
      .getAllByRole("listitem")
      .map((item) => item.querySelector(".exp-allocation__name")?.textContent);

    expect(names).toEqual([
      "Salaries & Allowances",
      "Utilities & Maintenance",
      "Instructional Materials",
      "Co-curricular & Ops",
    ]);

    // Each legend row restates its share of the 540M total.
    const legend = card.querySelector(".exp-allocation__list") as HTMLElement;

    expect(legend).toHaveTextContent("UGX 280.0M (51.9%)");
    expect(legend).toHaveTextContent("UGX 115.0M (21.3%)");
    expect(legend).toHaveTextContent("UGX 90.0M (16.7%)");
    expect(legend).toHaveTextContent("UGX 55.0M (10.2%)");
  });

  it("renders a budget and an expenditure bar per department", () => {
    render(<ExpenseManagement />);

    const card = cardFor("Departmental Budget vs. Actual Expenditure");

    const bars = within(card).getAllByRole("progressbar");

    // Seven departments, two bars each.
    expect(bars).toHaveLength(14);

    const list = card.querySelector(".exp-bars") as HTMLElement;

    const labels = within(list)
      .getAllByRole("listitem")
      .map((item) => item.querySelector(".exp-bars__label")?.textContent);

    expect(labels).toEqual([
      "Academics",
      "Boarding",
      "Admin & HR",
      "Transport",
      "ICT / Tech",
      "Sports",
      "Health",
    ]);

    // Values are shown per department, budget first.
    expect(list).toHaveTextContent("240M");
    expect(list).toHaveTextContent("110M");
    expect(list).toHaveTextContent("38.5M");
    expect(list).toHaveTextContent("21.5M");

    // Both bars share one scale, so the largest budget fills its track.
    const academicsBudget = within(card).getByRole("progressbar", {
      name: "Academics budget",
    });

    expect(academicsBudget).toHaveAttribute("aria-valuenow", "240");
    expect(academicsBudget).toHaveAttribute("aria-valuemax", "240");

    const academicsActual = within(card).getByRole("progressbar", {
      name: "Academics expenditure",
    });

    expect(academicsActual).toHaveAttribute("aria-valuenow", "110");

    // The caption reconciles the two columns of the chart.
    expect(card.querySelector(".exp-bars__caption")).toHaveTextContent(
      "UGX 334.5M spent against UGX 655.5M budgeted across 7 departments.",
    );
  });

  it("renders the pending requisitions table", () => {
    render(<ExpenseManagement />);

    const card = cardFor("High-Value Requisitions Pending Approval");
    const table = within(card).getByRole("table");

    [
      "Requisition ID",
      "Item / Vendor Description",
      "Amount",
      "Campus",
      "Approval Status",
    ].forEach((heading) => {
      expect(
        within(table).getByRole("columnheader", { name: heading }),
      ).toBeInTheDocument();
    });

    // One header row plus three requisitions.
    expect(within(table).getAllByRole("row")).toHaveLength(4);

    const uneb = within(table).getByRole("row", { name: /PO-2028-089/ });

    expect(
      within(uneb).getByText("UNEB Exam Registration & Stationery Materials"),
    ).toBeInTheDocument();
    expect(within(uneb).getByText("UGX 32.5M")).toBeInTheDocument();
    expect(within(uneb).getByText("Kibuli Main")).toBeInTheDocument();
    expect(
      within(uneb).getByText("Pending CFO Clearance"),
    ).toHaveClass("exp-pill--attention");
  });

  it("tones each approval status pill from the data", () => {
    render(<ExpenseManagement />);

    const table = screen.getByRole("table");

    expect(
      within(
        within(table).getByRole("row", { name: /PO-2028-092/ }),
      ).getByText("Pending Procurement Verification"),
    ).toHaveClass("exp-pill--review");

    expect(
      within(
        within(table).getByRole("row", { name: /PO-2028-095/ }),
      ).getByText("Queued for Board Approval"),
    ).toHaveClass("exp-pill--queued");
  });
});
