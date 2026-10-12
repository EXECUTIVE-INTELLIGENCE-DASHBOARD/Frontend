import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampusFilter } from "./CampusFilter";

describe("CampusFilter", () => {
  it("renders the default selected campus", () => {
    render(<CampusFilter />);

    expect(
      screen.getByRole("button", {
        name: "Campus: All Campuses",
      })
    ).toBeInTheDocument();
  });

  it("opens the dropdown when clicked", () => {
    render(<CampusFilter />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Campus: All Campuses",
      })
    );

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "All Campuses",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Kibuli Main Campus",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Buwaate Campus",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", {
        name: "Annex / Preschool Branch",
      })
    ).toBeInTheDocument();
  });

  it("selects a campus and closes the dropdown", () => {
    render(<CampusFilter />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Campus: All Campuses",
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Kibuli Main Campus",
      })
    );

    expect(
      screen.getByRole("button", {
        name: "Campus: Kibuli Main Campus",
      })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("listbox")
    ).not.toBeInTheDocument();
  });

  it("calls onCampusChange with the selected campus", () => {
    const onCampusChange = vi.fn();

    render(<CampusFilter onCampusChange={onCampusChange} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Campus: All Campuses",
      })
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Buwaate Campus",
      })
    );

    expect(onCampusChange).toHaveBeenCalledWith("Buwaate Campus");
    expect(onCampusChange).toHaveBeenCalledTimes(1);
  });

  it("marks the selected campus in the dropdown", () => {
    render(<CampusFilter />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Campus: All Campuses",
      })
    );

    expect(
      screen.getByRole("option", {
        name: "All Campuses",
      })
    ).toHaveAttribute("aria-selected", "true");

    expect(
      screen.getByRole("option", {
        name: "Kibuli Main Campus",
      })
    ).toHaveAttribute("aria-selected", "false");
  });

  it("closes the dropdown when the trigger is clicked again", () => {
    render(<CampusFilter />);

    const trigger = screen.getByRole("button", {
      name: "Campus: All Campuses",
    });

    fireEvent.click(trigger);

    expect(screen.getByRole("listbox")).toBeInTheDocument();

    fireEvent.click(trigger);

    expect(
      screen.queryByRole("listbox")
    ).not.toBeInTheDocument();
  });
});