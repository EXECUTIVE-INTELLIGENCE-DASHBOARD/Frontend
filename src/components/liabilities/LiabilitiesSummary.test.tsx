import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LiabilitiesSummary } from "./LiabilitiesSummary";

describe("LiabilitiesSummary", () => {
  it("renders the liabilities summary section", () => {
    render(<LiabilitiesSummary />);

    expect(
      screen.getByRole("region", {
        name: "Liabilities summary",
      }),
    ).toBeInTheDocument();
  });

  it("renders all three liability cards", () => {
    render(<LiabilitiesSummary />);

    expect(screen.getByText("TOTAL LIABILITIES")).toBeInTheDocument();

    expect(screen.getByText("DUE IN NEXT 30 DAYS")).toBeInTheDocument();

    expect(screen.getByText("OVERDUE PAYABLES")).toBeInTheDocument();
  });

  it("displays the liability amounts", () => {
    render(<LiabilitiesSummary />);

    expect(screen.getByText("UGX 142.5M")).toBeInTheDocument();

    expect(screen.getByText("UGX 94.2M")).toBeInTheDocument();

    expect(screen.getByText("UGX 12.3M")).toBeInTheDocument();
  });

  it("provides a description for each liability metric", () => {
    render(<LiabilitiesSummary />);

    expect(
      screen.getByText("Total outstanding liabilities across all campuses"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Liabilities due within the next 30 days")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Outstanding payments past their due date"),
    ).toBeInTheDocument();
  });

  it("renders exactly three liability cards", () => {
    render(<LiabilitiesSummary />);

    expect(screen.getAllByRole("article")).toHaveLength(3);
  });
});
