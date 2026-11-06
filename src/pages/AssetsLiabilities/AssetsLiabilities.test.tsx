import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AssetsLiabilities } from "./AssetsLiabilities";
import { MemoryRouter } from "react-router-dom";
import {
  getFinancialPosition,
  type FinancialPosition,
  type PositionFigures,
} from "./assetsLiabilities.api";

vi.mock("./assetsLiabilities.api", () => ({ getFinancialPosition: vi.fn() }));

const M = 1_000_000;

const figures = (scale: number): PositionFigures => ({
  cash: 500 * M * scale,
  debtors: 870 * M * scale,
  fixed: 3280 * M * scale,
  fixed_by_category: [
    { key: "vehicle", label: "Fleet & Vehicles", amount: 1460 * M * scale },
    {
      key: "computer_equipment",
      label: "ICT Hardware",
      amount: 1820 * M * scale,
    },
  ],
  creditors: 176 * M * scale,
  tax: 36 * M * scale,
  loan_current: 460 * M * scale,
  loan_long: 1250 * M * scale,
  other_long_term: 0,
  current_assets: 1370 * M * scale,
  current_liabilities: 672 * M * scale,
  long_term_liabilities: 1250 * M * scale,
  assets: 4650 * M * scale,
  liabilities: 1922 * M * scale,
  net: 2728 * M * scale,
  current_ratio: 2.04,
});

const position: FinancialPosition = {
  period: { start: "2026-01-01", end: "2026-11-01" },
  school: null,
  schools: [
    { id: 1, name: "GreenHill Academy Nursery Kibuli", campus: "kibuli" },
    { id: 2, name: "Greenhill International School", campus: "gis" },
  ],
  at: figures(1),
  before: figures(0.8),
  trend: [
    {
      date: "2026-01-01",
      assets: 3720 * M,
      liabilities: 1540 * M,
      net: 2180 * M,
    },
    {
      date: "2026-11-01",
      assets: 4650 * M,
      liabilities: 1922 * M,
      net: 2728 * M,
    },
  ],
  by_school: [
    {
      id: 1,
      name: "GreenHill Academy Nursery Kibuli",
      campus: "kibuli",
      fixed: 130 * M,
      cash: 38 * M,
      debtors: 42 * M,
      assets: 210 * M,
      liabilities: 104 * M,
      net: 106 * M,
      current_ratio: 1.93,
      net_change: 52 * M,
    },
    {
      id: 2,
      name: "Greenhill International School",
      campus: "gis",
      fixed: 990 * M,
      cash: 165 * M,
      debtors: 399 * M,
      assets: 1554 * M,
      liabilities: 293 * M,
      net: 1261 * M,
      current_ratio: 5.32,
      net_change: 372 * M,
    },
  ],
  debtors: {
    total: 870 * M,
    parts: [
      { key: "under_30", label: "Under 30 days", amount: 500 * M },
      { key: "31_60", label: "31–60 days", amount: 200 * M },
      { key: "61_90", label: "61–90 days", amount: 100 * M },
      { key: "over_90", label: "Over 90 days", amount: 70 * M },
    ],
  },
  debtor_sections: {
    total: 870 * M,
    parts: [
      { key: "day", label: "Day learners", amount: 600 * M },
      { key: "boarding", label: "Boarding learners", amount: 270 * M },
    ],
  },
  asset_condition: {
    total: 3280 * M,
    parts: [
      { key: "operational", label: "Operational (Good)", amount: 2800 * M },
      {
        key: "servicing_required",
        label: "Servicing Required",
        amount: 300 * M,
      },
      { key: "critical", label: "Critical / Repair Queued", amount: 180 * M },
    ],
  },
};

describe("AssetsLiabilities", () => {
  const load = vi.mocked(getFinancialPosition);
  beforeEach(() => load.mockReset());

  it("shows the four headline figures without descriptions", async () => {
    load.mockResolvedValue(position);
    render(<AssetsLiabilities />);

    const headline = await screen.findByRole("region", {
      name: "Headline figures",
    });
    for (const [label, value] of [
      ["Total assets", "4.65B"],
      ["Total liabilities", "1.92B"],
      ["Net position", "2.73B"],
      ["Current ratio", "2.04×"],
    ]) {
      expect(within(headline).getByText(label)).toBeInTheDocument();
      expect(within(headline).getByText(value)).toBeInTheDocument();
    }
    expect(within(headline).queryByText(/since/)).not.toBeInTheDocument();
  });

  it("titles the two sides simply, with no links", async () => {
    load.mockResolvedValue(position);
    render(<AssetsLiabilities />);

    const assets = await screen.findByRole("article", { name: "Assets" });
    const liabilities = screen.getByRole("article", { name: "Liabilities" });
    expect(
      within(assets).queryByRole("button", { name: /Management/ }),
    ).not.toBeInTheDocument();
    expect(
      within(liabilities).queryByRole("button", { name: /Management/ }),
    ).not.toBeInTheDocument();
    expect(within(assets).getByText("Fleet & Vehicles")).toBeInTheDocument();
    expect(
      within(liabilities).getByText("Tax and statutory (PAYE, NSSF)"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/what we own|what we owe/i),
    ).not.toBeInTheDocument();
  });

  it("hides and shows the asset categories", async () => {
    load.mockResolvedValue(position);
    render(<AssetsLiabilities />);

    const assets = await screen.findByRole("article", { name: "Assets" });
    fireEvent.click(
      within(assets).getByRole("button", { name: "Hide categories" }),
    );
    expect(
      within(assets).queryByText("Fleet & Vehicles"),
    ).not.toBeInTheDocument();
  });

  it("links Debtors to Revenue and Asset condition to Asset Management", async () => {
    load.mockResolvedValue(position);

    render(
      <MemoryRouter>
        <AssetsLiabilities />
      </MemoryRouter>,
    );

    const debtors = await screen.findByRole("article", { name: "Debtors" });

    const revenueLink = within(debtors).getByRole("link", { name: /Revenue/ });
    expect(revenueLink).toHaveAttribute("href", "/revenue-fee-collection");

    const condition = screen.getByRole("article", { name: "Asset condition" });

    const assetManagementLink = within(condition).getByRole("link", {
      name: /Asset Management/,
    });
    expect(assetManagementLink).toHaveAttribute("href", "/asset-management");

    expect(within(condition).getByText("480M")).toBeInTheDocument();
  });

  it("lists each school, and narrows to one school when picked", async () => {
    load.mockResolvedValue(position);
    render(<AssetsLiabilities />);

    const table = await screen.findByRole("article", { name: "By school" });
    expect(within(table).getByText("Kibuli Nursery")).toBeInTheDocument();
    expect(within(table).getByText("GIS")).toBeInTheDocument();

    load.mockResolvedValue({ ...position, school: 2 });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "2" } });
    await screen.findByRole("article", { name: "Assets" });

    expect(load).toHaveBeenLastCalledWith(
      expect.objectContaining({ school: 2 }),
    );
    expect(
      screen.queryByRole("article", { name: "By school" }),
    ).not.toBeInTheDocument();
  });

  it("says so when the server cannot be reached", async () => {
    load.mockResolvedValue(null);
    render(<AssetsLiabilities />);

    expect(
      await screen.findByText("The finance server could not be reached."),
    ).toBeInTheDocument();
  });
});
