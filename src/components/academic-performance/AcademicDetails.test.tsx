import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AcademicDetails } from "./AcademicDetails";

describe("AcademicDetails", () => {
  it("renders the academic details section", () => {
    render(<AcademicDetails />);

    expect(
      screen.getByRole("region", {
        name: "Subject comparison and test results",
      }),
    ).toBeInTheDocument();
  });

  it("renders both subject comparison and test results cards", () => {
    render(<AcademicDetails />);

    expect(
      screen.getByRole("heading", { name: "Subject Comparison" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Test Results" }),
    ).toBeInTheDocument();
  });

  it("renders the subject comparison column headings", () => {
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Subject Comparison" })
      .closest("article");

    expect(card).not.toBeNull();

    const comparison = within(card as HTMLElement);

    expect(comparison.getByText("Subject")).toBeInTheDocument();
    expect(comparison.getByText("Level")).toBeInTheDocument();
    expect(comparison.getByText("Pass rate")).toBeInTheDocument();
    expect(comparison.getByText("Change")).toBeInTheDocument();
  });

  it("renders all 12 subjects by default", () => {
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Subject Comparison" })
      .closest("article");

    expect(card).not.toBeNull();

    const rows = card!.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(12);
  });

  it("displays subject pass rates and changes", () => {
    render(<AcademicDetails />);

    const comparison = screen
      .getByRole("heading", {
        name: "Subject Comparison",
      })
      .closest("article");

    expect(comparison).not.toBeNull();

    // Mathematics has an 88% pass rate at both levels.
    expect(within(comparison!).getAllByText("88%")).toHaveLength(2);

    // Multiple subjects can have the same change.
    expect(within(comparison!).getAllByText("+4%").length).toBeGreaterThan(1);

    // At least one subject has a negative change.
    expect(within(comparison!).getByText("-2%")).toBeInTheDocument();
  });

  it("filters subjects by academic level", async () => {
    const user = userEvent.setup();
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Subject Comparison" })
      .closest("article");

    expect(card).not.toBeNull();

    const comparison = within(card as HTMLElement);

    await user.selectOptions(
      comparison.getByRole("combobox", {
        name: "Academic level",
      }),
      "O Level",
    );

    const rows = card!.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(7);

    rows.forEach((row) => {
      expect(row).toHaveTextContent("O Level");
      expect(row).not.toHaveTextContent("A Level");
    });
  });

  it("filters subjects by category", async () => {
    const user = userEvent.setup();
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Subject Comparison" })
      .closest("article");

    expect(card).not.toBeNull();

    const comparison = within(card as HTMLElement);

    await user.selectOptions(
      comparison.getByRole("combobox", {
        name: "Subject category",
      }),
      "Science",
    );

    expect(comparison.getAllByText("Physics")).toHaveLength(2);
    expect(comparison.getAllByText("Mathematics")).toHaveLength(2);
    expect(comparison.getAllByText("Chemistry")).toHaveLength(2);
    expect(comparison.getByText("Biology")).toBeInTheDocument();

    expect(comparison.queryByText("English Language")).not.toBeInTheDocument();

    expect(comparison.queryByText("History")).not.toBeInTheDocument();
    expect(comparison.queryByText("Literature")).not.toBeInTheDocument();
    expect(comparison.queryByText("Economics")).not.toBeInTheDocument();
  });

  it("combines the academic level and category filters", async () => {
    const user = userEvent.setup();
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Subject Comparison" })
      .closest("article");

    expect(card).not.toBeNull();

    const comparison = within(card as HTMLElement);

    await user.selectOptions(
      comparison.getByRole("combobox", {
        name: "Academic level",
      }),
      "A Level",
    );

    await user.selectOptions(
      comparison.getByRole("combobox", {
        name: "Subject category",
      }),
      "Science",
    );

    const rows = card!.querySelectorAll(".acad-details__subject-row");

    expect(rows).toHaveLength(3);

    expect(comparison.getByText("Physics")).toBeInTheDocument();
    expect(comparison.getByText("Mathematics")).toBeInTheDocument();
    expect(comparison.getByText("Chemistry")).toBeInTheDocument();

    expect(comparison.queryByText("Literature")).not.toBeInTheDocument();
  });

  it("renders Test 2 as the default assessment", () => {
    render(<AcademicDetails />);

    expect(
      screen.getByRole("columnheader", {
        name: "Test 2 score",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("columnheader", {
        name: "Students assessed",
      }),
    ).toBeInTheDocument();
  });

  it("renders all eight test result rows by default", () => {
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Test Results" })
      .closest("article");

    expect(card).not.toBeNull();

    const rows = card!.querySelectorAll("tbody tr");

    expect(rows).toHaveLength(8);
  });

  it("displays Test 2 scores by default", () => {
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Test Results" })
      .closest("article");

    expect(card).not.toBeNull();

    const results = within(card as HTMLElement);

    expect(results.getByText("78%")).toBeInTheDocument();
    expect(results.getByText("84%")).toBeInTheDocument();
    expect(results.getByText("81%")).toBeInTheDocument();
  });

  it("updates the score column when Test 1 is selected", async () => {
    const user = userEvent.setup();
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Test Results" })
      .closest("article");

    expect(card).not.toBeNull();

    const results = within(card as HTMLElement);

    await user.selectOptions(
      results.getByRole("combobox", {
        name: "Assessment",
      }),
      "Test 1",
    );

    expect(
      results.getByRole("columnheader", {
        name: "Test 1 score",
      }),
    ).toBeInTheDocument();

    expect(results.getByText("72%")).toBeInTheDocument();
    expect(results.getByText("81%")).toBeInTheDocument();
  });

  it("filters test results by academic level", async () => {
    const user = userEvent.setup();
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Test Results" })
      .closest("article");

    expect(card).not.toBeNull();

    const results = within(card as HTMLElement);

    await user.selectOptions(
      results.getByRole("combobox", {
        name: "Academic level",
      }),
      "A Level",
    );

    const rows = card!.querySelectorAll("tbody tr");

    expect(rows).toHaveLength(4);

    expect(results.getByText("Literature")).toBeInTheDocument();
    expect(results.getByText("Economics")).toBeInTheDocument();

    expect(results.queryByText("English Language")).not.toBeInTheDocument();
  });

  it("displays the correct student assessment counts", () => {
    render(<AcademicDetails />);

    const card = screen
      .getByRole("heading", { name: "Test Results" })
      .closest("article");

    expect(card).not.toBeNull();

    const results = within(card as HTMLElement);

    expect(results.getAllByText("120")).toHaveLength(2);
    expect(results.getAllByText("96")).toHaveLength(2);
    expect(results.getAllByText("54")).toHaveLength(2);
    expect(results.getAllByText("42")).toHaveLength(2);
  });
});
