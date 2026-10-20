import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RevenueDetails } from "./RevenueDetails";

describe("RevenueDetails", () => {
  it("renders all three summary cards with the correct amounts", () => {
    render(<RevenueDetails campus="Kibuli Main Campus" section="Primary" />);

    expect(screen.getByText("Billed Revenue")).toBeInTheDocument();
    expect(screen.getByText("UGX 850.0M")).toBeInTheDocument();

    expect(screen.getByText("Collections Received")).toBeInTheDocument();
    expect(screen.getByText("UGX 620.5M")).toBeInTheDocument();

    expect(screen.getByText("Outstanding Arrears")).toBeInTheDocument();
    expect(screen.getByText("UGX 229.5M")).toBeInTheDocument();
  });
  it("renders the campus revenue table", () => {
    render(<RevenueDetails campus="Kibuli Main Campus" section="Primary" />);

    const table = screen.getByRole("table");

    expect(table).toBeInTheDocument();

    expect(within(table).getByText("Kibuli Main Campus")).toBeInTheDocument();
  });

  it("renders the correct campus collection percentage", () => {
    render(<RevenueDetails campus="Kibuli Main Campus" section="Primary" />);

    const table = within(screen.getByRole("table"));

    expect(table.getByText("80.0%")).toBeInTheDocument();
  });

  it("renders all six revenue streams", () => {
    render(<RevenueDetails campus="Kibuli Main Campus" section="Primary" />);

    expect(screen.getByText("Tuition")).toBeInTheDocument();

    expect(screen.getByText("Extracurricular & Clubs")).toBeInTheDocument();

    expect(screen.getByText("Admission & Registration")).toBeInTheDocument();

    expect(screen.getByText("Minimart")).toBeInTheDocument();

    expect(screen.getByText("Donations")).toBeInTheDocument();

    expect(screen.getByText("Alumni Contributions")).toBeInTheDocument();
  });

  it("renders the correct revenue stream progress values", () => {
    render(<RevenueDetails campus="Kibuli Main Campus" section="Primary" />);

    expect(
      screen.getByRole("progressbar", {
        name: "Tuition share",
      }),
    ).toHaveAttribute("aria-valuenow", "76.5");

    expect(
      screen.getByRole("progressbar", {
        name: "Minimart share",
      }),
    ).toHaveAttribute("aria-valuenow", "10");
  });
});
