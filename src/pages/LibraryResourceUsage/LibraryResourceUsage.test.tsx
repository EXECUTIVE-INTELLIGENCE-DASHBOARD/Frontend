import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LibraryResourceUsage } from "./LibraryResourceUsage";

/** The metric label also appears in the chart legend and table headers. */
function findMetricCard(label: string) {
  return screen
    .getAllByText(label)
    .map((element) => element.closest("article"))
    .find((card): card is HTMLElement => card !== null);
}

describe("LibraryResourceUsage", () => {
  it("renders the page heading", () => {
    render(<LibraryResourceUsage />);

    expect(
      screen.getByRole("heading", { name: "Library & Resource Usage" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Monitor circulation, resource availability and demand to guide accession and acquisition planning\./,
      ),
    ).toBeInTheDocument();
  });

  it("renders the circulation metrics", () => {
    render(<LibraryResourceUsage />);

    const expectedMetrics: Array<[string, string]> = [
      ["Checkouts", "1,240"],
      ["Returns", "1,180"],
      ["Available", "6,200"],
      ["Overdue Items", "64"],
    ];

    for (const [label, value] of expectedMetrics) {
      const card = findMetricCard(label);

      expect(card).toBeDefined();
      expect(within(card as HTMLElement).getByText(value)).toBeInTheDocument();
    }
  });

  it("renders the volume trend and school activity cards", () => {
    render(<LibraryResourceUsage />);

    expect(
      screen.getByRole("heading", { name: /Checkout & Return Volumes/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Activity by School & Period/i }),
    ).toBeInTheDocument();

    expect(screen.getAllByText("Checkouts").length).toBeGreaterThan(1);
    expect(screen.getByText("Sample school A")).toBeInTheDocument();
    expect(screen.getByText("+52")).toBeInTheDocument();
  });

  it("renders the inventory, condition and acquisition cards", () => {
    render(<LibraryResourceUsage />);

    expect(
      screen.getByRole("heading", {
        name: /Resource Availability & Inventory/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Overdue, Lost & Damaged Resources/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /Shortages & Acquisition Planning/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Art & textbooks")).toBeInTheDocument();
    expect(screen.getByText("Written off")).toBeInTheDocument();
    expect(
      screen.getByText("Use existing stock first — 5 of the 14 requests are for titles already held at another campus."),
    ).toBeInTheDocument();
  });

  it("renders the frequently requested titles card", () => {
    render(<LibraryResourceUsage />);

    expect(
      screen.getByRole("heading", {
        name: /Frequently Requested & Under-used Titles/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText("Practical Chemistry")).toBeInTheDocument();
    expect(screen.getAllByText("Over-subscribed · order more").length).toBe(2);
    expect(
      screen.getByText("Under-used · promote or reallocate"),
    ).toBeInTheDocument();
  });
});
