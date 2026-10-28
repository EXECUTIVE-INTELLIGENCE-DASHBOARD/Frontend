import { beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Liabilities } from "./Liabilities";
import { getLiabilitiesApiData } from "./liabilities.api";
import type { LiabilitiesApiData } from "./liabilities.api";

vi.mock("./liabilities.api", () => ({
  getLiabilitiesApiData: vi.fn(),
}));

const mockGetData = vi.mocked(getLiabilitiesApiData);

const dashboardData: LiabilitiesApiData = {
  dashboard: {
    summary: {
      total_outstanding: 100,
      due_within_30_days: 40,
      overdue: 60,
      liability_count: 2,
      overdue_count: 1,
    },
    by_category: [],
    by_status: [],
    top_creditors: [],
    as_of_date: "2026-10-28",
  },
  liabilities: [],
  creditors: [],
  schools: [
    {
      id: 1,
      name: "Kibuli Nursery",
      campus: "kibuli",
      campus_display: "Kibuli Main Campus",
      level: "nursery",
    },
    {
      id: 2,
      name: "Buwaate Primary",
      campus: "buwaate",
      campus_display: "Buwaate Campus",
      level: "primary",
    },
  ],
  schoolFees: { summary: { fees_not_received: 0 }, breakdown: [] },
  loans: [],
  repayments: [],
  bankAccounts: [],
  cashForecasts: [],
};

describe("Liabilities page", () => {
  beforeEach(() => {
    mockGetData.mockReset();
    mockGetData.mockResolvedValue(dashboardData);
  });

  it("renders the liabilities page", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("main"),
    ).toBeInTheDocument();
  });

  it("renders the campus filter", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("combobox", { name: "Campus filter" }),
    ).toBeInTheDocument();
  });

  it("shows all backend campuses by default", async () => {
    render(<Liabilities />);

    const campusFilter = screen.getByRole("combobox", { name: "Campus filter" });
    expect(campusFilter).toHaveValue("");
    expect(await screen.findByRole("option", { name: "Kibuli Main Campus" })).toHaveValue("kibuli");
    expect(screen.getByRole("option", { name: "Buwaate Campus" })).toHaveValue("buwaate");
  });

  it("updates the selected campus when a different campus is selected", async () => {
    const user = userEvent.setup();

    render(<Liabilities />);

    await screen.findByRole("option", { name: "Kibuli Main Campus" });
    const campusFilter = screen.getByRole("combobox", {
      name: "Campus filter",
    });

    await user.selectOptions(campusFilter, "kibuli");

    expect(campusFilter).toHaveValue("kibuli");
    expect(screen.getByRole("combobox", { name: "Section filter" })).toHaveValue("");
    expect(screen.getByRole("option", { name: "Nursery" })).toHaveValue("nursery");
  });

  it("renders the liabilities overview section", async () => {
    render(<Liabilities />);

    expect(
      await screen.findByRole("region", { name: "Liabilities overview" }),
    ).toBeInTheDocument();
  });

  it("loads the liability API and renders the live dashboard panels", async () => {
    render(<Liabilities />);

    expect(
      await screen.findByRole("region", { name: "Liabilities overview" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Data as of/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /Live view of outstanding liabilities|Outstanding bills \+ loan balance|bills past due|% of loan repaid|Bank cash ÷/,
      ),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Any overdue statutory payment")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Needs attention" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Debtors and creditors" })).toBeInTheDocument();
    expect(mockGetData).toHaveBeenCalledWith(expect.any(AbortSignal));
  }, 15000);

  it("shows a retry action when the liability API fails", async () => {
    mockGetData.mockRejectedValue(new Error("Service unavailable"));
    render(<Liabilities />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Service unavailable",
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders the liabilities details section", async () => {
    render(<Liabilities />);

    expect(
      await screen.findByRole("region", { name: "Liabilities details" }),
    ).toBeInTheDocument();
  });

  it("renders the composition and top-creditors cards", async () => {
    render(<Liabilities />);

    expect(
      await screen.findByRole("heading", { name: "What is owed, by type" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Top 5 creditors/ }),
    ).toBeInTheDocument();
  });

  it("places the loans table after the other liability panels", async () => {
    render(<Liabilities />);

    expect(await screen.findByRole("heading", { name: "Loans" })).toBeInTheDocument();
    expect(screen.getByRole("main").lastElementChild).toHaveClass("liability-loans");
  });

  it("does not render a second Sidebar or Hero", () => {
    render(<Liabilities />);

    expect(
      screen.queryByRole("navigation"),
    ).not.toBeInTheDocument();
  });
});