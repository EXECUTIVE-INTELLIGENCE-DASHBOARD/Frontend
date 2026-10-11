
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Liabilities } from "./Liabilities";

vi.mock("../../components/filters/CampusFilter", async () => {
  const React = await import("react");

  const options = [
    "All Campuses",
    "Kibuli Main Campus",
    "Buwaate Campus",
    "Annex / Preschool Branch",
  ];

  return {
    CampusFilter: ({
      onCampusChange,
    }: {
      onCampusChange?: (campus: string) => void;
    }) =>
      React.createElement(
        "select",
        {
          "aria-label": "Campus filter",
          defaultValue: "All Campuses",
          onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
            onCampusChange?.(event.target.value),
        },
        options.map((campus) =>
          React.createElement("option", { key: campus, value: campus }, campus),
        ),
      ),
  };
});

describe("Liabilities page", () => {
  it("renders the page heading and description", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("heading", { name: "Liabilities Management" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Monitor outstanding obligations/i),
    ).toBeInTheDocument();
  });

  it("renders the campus filter", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("combobox", { name: "Campus filter" }),
    ).toBeInTheDocument();
  });

  it("shows All Campuses by default", () => {
    render(<Liabilities />);

    expect(
      screen.getByText("Showing liabilities for").parentElement,
    ).toHaveTextContent("All Campuses");
  });

  it("updates the selected campus context", async () => {
    const user = userEvent.setup();

    render(<Liabilities />);

    await user.selectOptions(
      screen.getByRole("combobox", { name: "Campus filter" }),
      "Kibuli Main Campus",
    );

    expect(
      screen.getByText("Showing liabilities for").parentElement,
    ).toHaveTextContent("Kibuli Main Campus");
  });

  it("renders the summary, composition, and creditors sections", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("region", { name: "Liabilities overview" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Liabilities Composition/i }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: /Top 8 Outstanding Creditors/i }),
    ).toBeInTheDocument();
  });

  it("does not render a second Sidebar or Hero", () => {
    render(<Liabilities />);

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });
});
