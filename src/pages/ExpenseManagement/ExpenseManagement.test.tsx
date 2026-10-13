/**
 * Tests for the Expense Management page.
 *
 * Two things shape how these tests are written:
 *
 * 1. **The same figure appears in several places on purpose.** "UGX 96.4M" is
 *    the rent KPI card, one entry in the Spend Composition list and the Actual
 *    cell of the rent table row. The page is *supposed* to repeat itself —
 *    that is how a reader cross-checks the three cuts of the data — so an
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
      screen.getByText(/Tracks operating spend across rent, wages/i),
    ).toBeInTheDocument();

    // Scoped to the breadcrumb: the current crumb repeats the page title, so a
    // document-wide query for "Expense Management" would match the h1 as well.
    const breadcrumb = screen.getByRole("navigation", { name: "Breadcrumb" });

    expect(within(breadcrumb).getByText("Finance & Procurement")).toBeInTheDocument();
    expect(within(breadcrumb).getByText("Expense Management")).toBeInTheDocument();
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

  it("renders the four overhead KPI cards with figures and variances", () => {
    render(<ExpenseManagement />);

    const cards = screen.getAllByRole("article");

    expect(cards).toHaveLength(4);

    // [label, actual spend, share caption, variance caption] — in the order
    // the `overheads` array declares them, which is the render order.
    const expected: Array<[string, string, string, string]> = [
      ["Rent & Facilities", "UGX 96.4M", "16.0% of overheads", "+2.4% vs budget"],
      ["Wages & Salaries", "UGX 412.0M", "68.5% of overheads", "+1.8% vs budget"],
      ["Utilities", "UGX 58.7M", "9.8% of overheads", "−4.1% vs budget"],
      [
        "Marketing & Admissions",
        "UGX 34.2M",
        "5.7% of overheads",
        "+6.2% vs budget",
      ],
    ];

    expected.forEach(([label, amount, share, variance], index) => {
      const card = cards[index];

      expect(within(card).getByText(label)).toBeInTheDocument();
      expect(within(card).getByText(amount)).toBeInTheDocument();
      expect(card).toHaveTextContent(share);
      expect(card).toHaveTextContent(variance);
    });
  });

  it("paints over-budget KPI captions amber and under-budget captions green", () => {
    render(<ExpenseManagement />);

    const cards = screen.getAllByRole("article");

    // Rent (+2.4%), wages (+1.8%) and marketing (+6.2%) are at or over budget.
    // Utilities (−4.1%) is under.
    const tone = (index: number) =>
      cards[index].querySelector(".exp-metric__delta")?.className ?? "";

    expect(tone(0)).toContain("exp-metric__delta--over");
    expect(tone(1)).toContain("exp-metric__delta--over");
    expect(tone(2)).toContain("exp-metric__delta--under");
    expect(tone(3)).toContain("exp-metric__delta--over");
  });

  it("renders the three filter controls with their defaults", () => {
    render(<ExpenseManagement />);

    // The visible layer is a styled span, so the select is what carries the
    // accessible label. Defaults are always the "All ..." option.
    expect(screen.getByLabelText("Select Campus")).toHaveValue("All Campuses");
    expect(screen.getByLabelText("Department")).toHaveValue("All Departments");
    expect(screen.getByLabelText("Cost Centre")).toHaveValue("All Cost Centres");
  });

  it("updates a filter's visible value when another option is picked", () => {
    render(<ExpenseManagement />);

    const department = screen.getByLabelText("Department");

    fireEvent.change(department, { target: { value: "Finance" } });

    expect(department).toHaveValue("Finance");

    // The value the user actually sees is the aria-hidden span drawn under the
    // invisible select, so it has to be checked separately.
    const filter = department.closest(".exp-filter") as HTMLElement;

    expect(filter).toHaveTextContent("Finance");
  });

  it("renders the spend composition donut and allocation list", () => {
    render(<ExpenseManagement />);

    const card = cardFor("Spend Composition");

    expect(
      within(card).getByText("Total overheads UGX 601.3M"),
    ).toBeInTheDocument();

    expect(
      within(card).getByRole("img", {
        name: "Operating overheads split by category",
      }),
    ).toBeInTheDocument();

    // Centre of the ring.
    expect(within(card).getByText("601.3M")).toBeInTheDocument();
    expect(within(card).getByText("UGX total")).toBeInTheDocument();

    // The list restates the same four categories, largest first, which is a
    // different order from the KPI row above.
    const names = within(card)
      .getAllByRole("listitem")
      .map((item) => item.querySelector(".exp-allocation__name")?.textContent);

    expect(names).toEqual([
      "Wages & Salaries",
      "Rent & Facilities",
      "Utilities",
      "Marketing & Admissions",
    ]);
  });

  it("renders the monthly trend chart with its reconciliation caption", () => {
    render(<ExpenseManagement />);

    const card = cardFor("Monthly Spend Against Budget");

    expect(
      within(card).getByRole("img", {
        name: /Monthly operating spend compared with the monthly budget/i,
      }),
    ).toBeInTheDocument();

    expect(within(card).getByText("Actual")).toBeInTheDocument();
    expect(within(card).getByText("Budget")).toBeInTheDocument();

    // The caption must reconcile with the KPI cards — the twelve monthly
    // actuals sum to the same 601.3M as the four overhead cards.
    const caption = card.querySelector(".exp-chart__caption") as HTMLElement;

    expect(caption).toHaveTextContent("UGX 601.3M");
    expect(caption).toHaveTextContent("UGX 598.0M");
    expect(caption).toHaveTextContent("+3.3M");
    expect(caption).toHaveTextContent("peak in Sep");
  });

  it("renders one bar per campus", () => {
    render(<ExpenseManagement />);

    const card = cardFor("Spend by Campus");
    const bars = within(card).getAllByRole("progressbar");

    expect(bars).toHaveLength(6);

    // Read the bar labels from the list itself: the caption underneath repeats
    // the leading campus name, so a plain text query would match twice.
    const list = card.querySelector(".exp-bars") as HTMLElement;

    const labels = within(list)
      .getAllByRole("listitem")
      .map((item) => item.querySelector(".exp-bars__label")?.textContent);

    expect(labels).toEqual([
      "Nursery Kibuli",
      "Primary Kibuli",
      "Secondary Kibuli",
      "Nursery Buwaate",
      "Primary Buwaate",
      "International School",
    ]);

    expect(within(card).getByText("UGX 196.2M")).toBeInTheDocument();

    const top = within(card).getByRole("progressbar", {
      name: "Secondary Kibuli share of spend",
    });

    expect(top).toHaveAttribute("aria-valuenow", "32.6");
    expect(top).toHaveAttribute("aria-valuemax", "100");

    // The card's takeaway line names the same campus the bars rank first.
    expect(card.querySelector(".exp-bars__caption")).toHaveTextContent(
      "Secondary Kibuli carries 32.6% of all operating spend.",
    );
  });

  it("renders the budget variance table with a totals row", () => {
    render(<ExpenseManagement />);

    const table = screen.getByRole("table");

    expect(within(table).getByRole("columnheader", { name: "Category" })).toBeInTheDocument();
    expect(within(table).getByRole("columnheader", { name: "Variance" })).toBeInTheDocument();

    // One header row, four category rows, one totals row.
    expect(within(table).getAllByRole("row")).toHaveLength(6);

    const rent = within(table).getByRole("row", { name: /Rent & Facilities/ });

    expect(within(rent).getByText("UGX 94.1M")).toBeInTheDocument();
    expect(within(rent).getByText("UGX 96.4M")).toBeInTheDocument();
    expect(within(rent).getByText("16.0%")).toBeInTheDocument();
    expect(within(rent).getByText("+2.4%")).toBeInTheDocument();
    expect(within(rent).getByText("Over budget")).toHaveClass("exp-pill--over");
  });

  it("bands the variance status so a small overspend is not an alert", () => {
    render(<ExpenseManagement />);

    const table = screen.getByRole("table");

    // Wages is +1.8%, inside the ±2% dead band, so it reads "On track".
    expect(
      within(within(table).getByRole("row", { name: /Wages & Salaries/ })).getByText(
        "On track",
      ),
    ).toHaveClass("exp-pill--on-track");

    // Utilities is −4.1%, comfortably under.
    expect(
      within(within(table).getByRole("row", { name: /^Utilities/ })).getByText(
        "Under budget",
      ),
    ).toHaveClass("exp-pill--under");

    // Marketing is +6.2%, well over.
    expect(
      within(
        within(table).getByRole("row", { name: /Marketing & Admissions/ }),
      ).getByText("Over budget"),
    ).toHaveClass("exp-pill--over");
  });

  it("totals the variance table from the grand totals, not the row average", () => {
    render(<ExpenseManagement />);

    const table = screen.getByRole("table");
    const total = within(table).getByRole("row", { name: /Total overheads/ });

    expect(within(total).getByText("UGX 592.2M")).toBeInTheDocument();
    expect(within(total).getByText("UGX 601.3M")).toBeInTheDocument();
    expect(within(total).getByText("+1.5%")).toBeInTheDocument();
    expect(within(total).getByText("100.0%")).toBeInTheDocument();
    expect(within(total).getByText("On track")).toHaveClass("exp-pill--on-track");
  });
});
