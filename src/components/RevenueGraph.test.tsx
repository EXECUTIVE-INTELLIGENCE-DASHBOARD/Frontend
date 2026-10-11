
import type { ReactNode } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RevenueGraph } from "./RevenueGraph";

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  ComposedChart: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  CartesianGrid: () => null,
  Legend: () => null,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ReferenceLine: () => null,
  Bar: () => null,
  Line: () => null,
}));

describe("CalRevenueGraph", () => {
  it("renders the revenue trend heading", () => {
    render(<RevenueGraph />);

    expect(
      screen.getByRole("heading", {
        name: "Revenue Trend vs. Target",
      }),
    ).toBeInTheDocument();
  });

  it("renders the illustrative badge", () => {
    render(<RevenueGraph />);

    expect(screen.getByText("ILLUSTRATIVE")).toBeInTheDocument();
  });

  it("renders the year-to-date performance summary", () => {
    render(<RevenueGraph />);

    expect(screen.getByText("+4.3% above target")).toBeInTheDocument();

    expect(
      screen.getByText(
        "YTD UGX 620.5M realized vs UGX 595.0M target",
      ),
    ).toBeInTheDocument();
  });

  it("renders all three legend items", () => {
    render(<RevenueGraph />);

    expect(screen.getByText("Realized")).toBeInTheDocument();
    expect(screen.getByText("Target / budget")).toBeInTheDocument();
    expect(screen.getByText("Upcoming months")).toBeInTheDocument();
  });

  it("provides an accessible description of the chart", () => {
    render(<RevenueGraph />);

    expect(
      screen.getByRole("img", {
        name: /revenue trend versus target from january to december/i,
      }),
    ).toBeInTheDocument();
  });
});
