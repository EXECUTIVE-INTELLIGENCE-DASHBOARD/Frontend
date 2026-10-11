import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Revenue } from "./Revenue";

describe("Revenue", () => {
  it("renders the revenue page", () => {
    render(<Revenue />);

    expect(
      screen.getByRole("heading", {
        name: "Revenue Trend vs. Target",
      })
    ).toBeInTheDocument();
  });

  it("renders the revenue details section", () => {
    render(<Revenue />);

    expect(
      screen.getByText("EXPECTED BILLED REVENUE")
    ).toBeInTheDocument();
  });

  it("renders the revenue graph", () => {
    render(<Revenue />);

    expect(
      screen.getByRole("heading", {
        name: "Revenue Trend vs. Target",
      })
    ).toBeInTheDocument();
  });

  it("renders the campus filter", () => {
    render(<Revenue />);

    expect(
      screen.getByRole("button", {
        name: /campus:\s*all campuses/i,
      })
    ).toBeInTheDocument();
  });
});