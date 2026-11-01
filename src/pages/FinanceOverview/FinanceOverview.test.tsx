import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FinanceOverview } from "./FinanceOverview";
import { getFinanceDashboard, type FinanceDashboard } from "./financeDashboard.api";

vi.mock("./financeDashboard.api", () => ({
  getFinanceDashboard: vi.fn(),
}));

const figures = (revenue: number, owed: number, overdue: number, budget: number, spent: number) => ({
  revenue,
  revenue_collected: revenue * 0.8,
  collected_percent: revenue ? 80 : null,
  liabilities: { owed, due_30_days: 0, overdue },
  budget: { budget, spent, used_percent: budget ? Math.round((spent * 1000) / budget) / 10 : null },
  expenses: spent,
  procurement: { spend: spent / 2, not_yet_paid: spent / 10 },
});

const dashboard: FinanceDashboard = {
  period: { start: "2026-01-01", end: "2026-10-27" },
  schools: [
    { id: 1, name: "GreenHill Academy Nursery Kibuli", campus: "kibuli",
      ...figures(80_000_000, 18_000_000, 0, 60_000_000, 30_000_000) },
    { id: 2, name: "Greenhill International School", campus: "gis",
      ...figures(200_000_000, 30_000_000, 9_000_000, 100_000_000, 105_000_000) },
  ],
  group: figures(0, 1_150_000_000, 0, 600_000_000, 0),
  totals: figures(280_000_000, 1_198_000_000, 9_000_000, 760_000_000, 135_000_000),
  expenses_by_month: [
    { month: "2026-09", label: "Sep 2026", total: 60_000_000, departments: [{ name: "Academics", amount: 60_000_000 }] },
    { month: "2026-10", label: "Oct 2026", total: 75_000_000, departments: [{ name: "Academics", amount: 75_000_000 }] },
  ],
};

const cards = ["Revenue", "Liabilities Management", "Budget Management", "Expense Management",
  "Procurement Financials"];

describe("FinanceOverview", () => {
  const load = vi.mocked(getFinanceDashboard);
  beforeEach(() => load.mockReset());

  it("shows the headline figures and one card per finance feature", async () => {
    load.mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    for (const title of cards) {
      expect(await screen.findByRole("article", { name: title })).toBeInTheDocument();
    }
    const headline = screen.getByRole("region", { name: "Headline figures" });
    expect(within(headline).getByText("280M")).toBeInTheDocument();
    expect(within(headline).getByText("48.0M")).toBeInTheDocument();
    expect(within(headline).getByText("84.4%")).toBeInTheDocument();
  });

  it("leaves out GHL: its figures are not added to any card", async () => {
    load.mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    const owed = await screen.findByRole("article", { name: "Liabilities Management" });
    expect(within(owed).getByText("48.0M")).toBeInTheDocument();
    expect(screen.queryByText(/GHL|Group/)).not.toBeInTheDocument();
    expect(screen.queryByText("1.20B")).not.toBeInTheDocument();
  });

  it("totals the monthly spending", async () => {
    load.mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    const card = await screen.findByRole("article", { name: "Expense Management" });
    expect(within(card).getByText("135M")).toBeInTheDocument();
  });

  it("asks for a longer range when there is under two months of spending", async () => {
    load.mockResolvedValue({ data: { ...dashboard, expenses_by_month: [] }, source: "api" });
    render(<FinanceOverview />);

    const card = await screen.findByRole("article", { name: "Expense Management" });
    expect(within(card).getByText(/two months or more/)).toBeInTheDocument();
  });

  it("loads 1 January to today, then follows the chosen dates", async () => {
    load.mockResolvedValue({ data: dashboard, source: "api" });
    const { container } = render(<FinanceOverview />);
    await screen.findByRole("article", { name: "Revenue" });

    const year = new Date().getFullYear();
    expect(load).toHaveBeenCalledWith(expect.objectContaining({ start: `${year}-01-01` }));

    const [from, to] = container.querySelectorAll<HTMLInputElement>('input[type="date"]');
    fireEvent.change(from, { target: { value: "2026-03-01" } });
    fireEvent.change(to, { target: { value: "2026-04-30" } });
    await screen.findByRole("article", { name: "Revenue" });

    expect(load).toHaveBeenLastCalledWith({ start: "2026-03-01", end: "2026-04-30" });
  });

  it("says so when the server cannot be reached", async () => {
    load.mockResolvedValue({ data: null, source: "offline" });
    render(<FinanceOverview />);

    expect(await screen.findByText("The finance server could not be reached.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
