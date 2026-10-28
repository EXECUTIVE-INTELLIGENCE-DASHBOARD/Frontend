import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LiabilitiesSummary } from "./LiabilitiesSummary";

describe("LiabilitiesSummary", () => {
  const metrics = [
    { label: "Total owed", amount: 142_500_000, kind: "total" as const },
    { label: "Overdue", amount: 12_300_000, kind: "overdue" as const },
    { label: "Loan balance", amount: 19_800_000, kind: "loan" as const },
    { label: "Bank cash balance", amount: 3_400_000, kind: "cash" as const },
  ];

  it("renders the liabilities summary section", () => {
    render(<LiabilitiesSummary metrics={metrics} />);

    expect(
      screen.getByRole("region", {
        name: "Liabilities summary",
      }),
    ).toBeInTheDocument();
  });

  it("renders all three liability cards", () => {
    render(<LiabilitiesSummary metrics={metrics} />);

    expect(screen.getByText("Total owed")).toBeInTheDocument();
    expect(screen.getByText("Overdue")).toBeInTheDocument();
    expect(screen.getByText("Loan balance")).toBeInTheDocument();
    expect(screen.getByText("Bank cash balance")).toBeInTheDocument();
  });

  it("displays the liability amounts", () => {
    render(<LiabilitiesSummary metrics={metrics} />);
    expect(screen.getByText("UGX 142.5M")).toBeInTheDocument();
    expect(screen.getByText("UGX 12.3M")).toBeInTheDocument();
    expect(screen.getByText("UGX 19.8M")).toBeInTheDocument();
    expect(screen.getByText("UGX 3.4M")).toBeInTheDocument();
  });

  it("does not render supporting descriptions", () => {
    render(<LiabilitiesSummary metrics={metrics} />);
    expect(screen.queryByText(/bills and loans|cash due ratio/i)).not.toBeInTheDocument();
  });

  it("renders exactly three liability cards", () => {
    render(<LiabilitiesSummary metrics={metrics} />);

    expect(screen.getAllByRole("article")).toHaveLength(4);
  });
});
