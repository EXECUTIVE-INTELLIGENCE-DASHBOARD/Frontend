import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FinanceOverview } from "./FinanceOverview";
import { getFinanceDashboard, type FinanceDashboard } from "./financeDashboard.api";

vi.mock("./financeDashboard.api", () => ({
  getFinanceDashboard: vi.fn(),
}));

const figures = (revenue: number, owed: number, overdue: number, budget: number, spent: number) => ({
  revenue,
  liabilities: { owed, due_30_days: 0, overdue },
  budget: { budget, spent, used_percent: budget ? Math.round((spent * 1000) / budget) / 10 : null },
  expenses: spent,
  procurement: { spend: spent / 2, not_yet_paid: 0 },
});

const dashboard: FinanceDashboard = {
  period: { start: "2026-01-01", end: "2026-10-27" },
  schools: [
    { id: 1, name: "GreenHill Academy Nursery Kibuli", campus: "kibuli",
      ...figures(80_000_000, 18_000_000, 0, 60_000_000, 30_000_000) },
    { id: 2, name: "Greenhill International School", campus: "gis",
      ...figures(200_000_000, 30_000_000, 9_000_000, 100_000_000, 105_000_000) },
  ],
  group: figures(0, 1_150_000_000, 0, 0, 0),
  totals: figures(280_000_000, 1_198_000_000, 9_000_000, 160_000_000, 135_000_000),
};

describe("FinanceOverview", () => {
  beforeEach(() => vi.mocked(getFinanceDashboard).mockReset());

  it("shows one card per finance feature", async () => {
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    for (const title of ["Revenue", "Liabilities Management", "Budget Management",
      "Expense Management", "Procurement Financials"]) {
      expect(await screen.findByRole("article", { name: title })).toBeInTheDocument();
    }
    expect(screen.getByText("280M")).toBeInTheDocument();
  });

  it("lists each school and the group in the liabilities card", async () => {
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    const card = await screen.findByRole("article", { name: "Liabilities Management" });
    expect(within(card).getByText("Kibuli Nursery")).toBeInTheDocument();
    expect(within(card).getByText("GIS")).toBeInTheDocument();
    expect(within(card).getByText("Group (GHL)")).toBeInTheDocument();
    expect(within(card).getAllByText("1.15B")).not.toHaveLength(0);
  });

  it("marks a school over budget", async () => {
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: dashboard, source: "api" });
    render(<FinanceOverview />);

    const card = await screen.findByRole("article", { name: "Budget Management" });
    expect(within(card).getByText("105%").closest("td")).toHaveClass("is-red");
    expect(within(card).getByText("50%").closest("td")).toHaveClass("is-green");
  });

  it("adds a group row to the budget only when the group has a budget", async () => {
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: dashboard, source: "api" });
    const { unmount } = render(<FinanceOverview />);
    let card = await screen.findByRole("article", { name: "Budget Management" });
    expect(within(card).queryByText("Group (GHL)")).not.toBeInTheDocument();
    unmount();

    const withGroup = { ...dashboard, group: figures(0, 0, 0, 600_000_000, 0) };
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: withGroup, source: "api" });
    render(<FinanceOverview />);
    card = await screen.findByRole("article", { name: "Budget Management" });
    expect(within(card).getByText("Group (GHL)")).toBeInTheDocument();
  });

  it("says so when the server cannot be reached", async () => {
    vi.mocked(getFinanceDashboard).mockResolvedValue({ data: null, source: "offline" });
    render(<FinanceOverview />);

    expect(await screen.findByText("The finance server could not be reached.")).toBeInTheDocument();
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
  });
});
