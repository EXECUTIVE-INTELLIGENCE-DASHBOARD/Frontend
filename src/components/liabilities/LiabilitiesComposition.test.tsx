
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LiabilitiesComposition } from "./LiabilitiesComposition";

describe("LiabilitiesComposition", () => {
  it("renders the liabilities composition section", () => {
    render(<LiabilitiesComposition />);

    expect(
      screen.getByRole("region", {
        name: "Liabilities Composition",
      }),
    ).toBeInTheDocument();
  });

  it("renders the composition heading", () => {
    render(<LiabilitiesComposition />);

    expect(
      screen.getByRole("heading", {
        name: "Liabilities Composition",
      }),
    ).toBeInTheDocument();
  });

  it("displays the total liabilities amount", () => {
    render(<LiabilitiesComposition />);

    expect(screen.getByText("UGX 142.5M")).toBeInTheDocument();
  });

  it("renders all three liability categories", () => {
    render(<LiabilitiesComposition />);

    expect(
      screen.getByText("Current Payables (0-30 Days)"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Accrued Expenses & Tax"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Long-Term Debt & Commitments"),
    ).toBeInTheDocument();
  });

  it("displays the correct liability amounts", () => {
    render(<LiabilitiesComposition />);

    expect(screen.getByText("UGX 94.2M")).toBeInTheDocument();
    expect(screen.getByText("UGX 28.5M")).toBeInTheDocument();
    expect(screen.getByText("UGX 19.8M")).toBeInTheDocument();
  });

  it("displays the liability percentages", () => {
    render(<LiabilitiesComposition />);

    expect(screen.getByText("66.1%")).toBeInTheDocument();
    expect(screen.getByText("20.0%")).toBeInTheDocument();
    expect(screen.getByText("13.9%")).toBeInTheDocument();
  });

  it("displays descriptions for all liability categories", () => {
    render(<LiabilitiesComposition />);

    expect(
      screen.getByText("Immediate obligations & invoices"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Statutory deductions & utilities"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Contracts, CapEx & Encumbered"),
    ).toBeInTheDocument();
  });

  it("renders exactly three liability breakdown rows", () => {
    render(<LiabilitiesComposition />);

    expect(
      document.querySelectorAll(".liability-breakdown"),
    ).toHaveLength(3);
  });
});
