import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { LiabilitiesComposition } from "./LiabilitiesComposition";

describe("LiabilitiesComposition", () => {
  const props = {
    categories: [
      { label: "Current payables", amount: 94_200_000, color: "#172448" },
      {
        label: "Accrued expenses and tax",
        amount: 28_500_000,
        color: "#2aa4dd",
      },
      { label: "Long-term debt", amount: 19_800_000, color: "#5b8fc1" },
    ],
  };

  it("renders the liabilities composition section", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(
      screen.getByRole("region", {
        name: "What is owed, by type",
      }),
    ).toBeInTheDocument();
  });

  it("renders the composition heading", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(
      screen.getByRole("heading", {
        name: "What is owed, by type",
      }),
    ).toBeInTheDocument();
  });

  it("displays the total liabilities amount", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(screen.getByText("UGX 142.5M")).toBeInTheDocument();
  });

  it("renders all three liability categories", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(screen.getByText("Current payables")).toBeInTheDocument();

    expect(screen.getByText("Accrued expenses and tax")).toBeInTheDocument();

    expect(screen.getByText("Long-term debt")).toBeInTheDocument();
  });

  it("displays the correct liability amounts", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(screen.getByText("UGX 94.2M")).toBeInTheDocument();
    expect(screen.getByText("UGX 28.5M")).toBeInTheDocument();
    expect(screen.getByText("UGX 19.8M")).toBeInTheDocument();
  });

  it("displays the liability percentages", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(screen.getByText("66%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();
    expect(screen.getByText("14%")).toBeInTheDocument();
  });

  it("does not include creditor rankings in the composition card", () => {
    render(<LiabilitiesComposition {...props} />);
    expect(screen.queryByText("Top 5 creditors")).not.toBeInTheDocument();
  });

  it("renders exactly three liability breakdown rows", () => {
    render(<LiabilitiesComposition {...props} />);

    expect(document.querySelectorAll(".liability-breakdown")).toHaveLength(3);
  });
});
