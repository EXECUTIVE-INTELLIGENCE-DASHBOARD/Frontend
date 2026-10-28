import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { OutstandingCreditors } from "./OutstandingCreditors";

const creditors = Array.from({ length: 6 }, (_, index) => ({
  id: index + 1,
  name: `Creditor ${index + 1}`,
  type: "Trade payable",
  owed: (index + 1) * 1_000_000,
  overdue: index === 0 ? 1_000_000 : 0,
  nextDue: "2026-11-15",
}));

describe("OutstandingCreditors", () => {
  it("shows a live top-five bar chart and expands to all creditors", async () => {
    const user = userEvent.setup();
    render(<OutstandingCreditors creditors={creditors} />);

    expect(screen.getByRole("heading", { name: /Top 5 creditors/ })).toBeInTheDocument();
    expect(screen.getByText("Creditor 1")).toBeInTheDocument();
    expect(screen.queryByText("Creditor 6")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Creditor 1: UGX 1.0M" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Show all 6 creditors" }),
    );
    expect(screen.getByText("Creditor 6")).toBeInTheDocument();
  });

  it("renders a clear empty state", () => {
    render(<OutstandingCreditors creditors={[]} />);
    expect(
      screen.getByText("No outstanding creditors for this selection."),
    ).toBeInTheDocument();
  });
});
