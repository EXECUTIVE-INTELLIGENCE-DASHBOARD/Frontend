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
          React.createElement(
            "option",
            { key: campus, value: campus },
            campus,
          ),
        ),
      ),
  };
});

describe("Liabilities page", () => {
  it("renders the liabilities page", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("main"),
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
      screen.getByRole("combobox", { name: "Campus filter" }),
    ).toHaveValue("All Campuses");
  });

  it("updates the selected campus when a different campus is selected", async () => {
    const user = userEvent.setup();

    render(<Liabilities />);

    const campusFilter = screen.getByRole("combobox", {
      name: "Campus filter",
    });

    await user.selectOptions(campusFilter, "Kibuli Main Campus");

    expect(campusFilter).toHaveValue("Kibuli Main Campus");
  });

  it("renders the liabilities overview section", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("region", { name: "Liabilities overview" }),
    ).toBeInTheDocument();
  });

  it("renders the liabilities details section", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("region", { name: "Liabilities details" }),
    ).toBeInTheDocument();
  });

  it("renders the liabilities composition and outstanding creditors sections", () => {
    render(<Liabilities />);

    expect(
      screen.getByRole("heading", { name: "Liabilities Composition" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Top 8 Outstanding Creditors" }),
    ).toBeInTheDocument();
  });

  it("does not render a second Sidebar or Hero", () => {
    render(<Liabilities />);

    expect(
      screen.queryByRole("navigation"),
    ).not.toBeInTheDocument();
  });
});