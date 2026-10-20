import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CampusFilter } from "./CampusFilter";

describe("CampusFilter", () => {
  it("renders the default selected campus", () => {
    render(<CampusFilter />);

    expect(screen.getByRole("combobox", { name: "Campus" })).toHaveValue(
      "All Campuses",
    );
  });

  it("renders all available campus options", () => {
    render(<CampusFilter />);

    const campusSelect = screen.getByRole("combobox", {
      name: "Campus",
    });

    expect(
      screen.getByRole("option", { name: "All Campuses" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Kibuli Main Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Buwaate Campus" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Annex / Preschool Branch" }),
    ).toBeInTheDocument();

    expect(campusSelect).toHaveValue("All Campuses");
  });

  it("selects a campus", () => {
    render(<CampusFilter />);

    const campusSelect = screen.getByRole("combobox", {
      name: "Campus",
    });

    fireEvent.change(campusSelect, {
      target: { value: "Kibuli Main Campus" },
    });

    expect(campusSelect).toHaveValue("Kibuli Main Campus");
  });

  it("calls onCampusChange with the selected campus", () => {
    const onCampusChange = vi.fn();

    render(<CampusFilter onCampusChange={onCampusChange} />);

    fireEvent.change(screen.getByRole("combobox", { name: "Campus" }), {
      target: { value: "Buwaate Campus" },
    });

    expect(onCampusChange).toHaveBeenCalledWith("Buwaate Campus");
    expect(onCampusChange).toHaveBeenCalledTimes(1);
  });

  it("renders the school section selector with its default value", () => {
    render(<CampusFilter />);

    expect(
      screen.getByRole("combobox", { name: "School section" }),
    ).toHaveValue("All Sections");
  });

  it("renders all available school section options", () => {
    render(<CampusFilter />);

    expect(
      screen.getByRole("option", { name: "All Sections" }),
    ).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Nursery" })).toBeInTheDocument();

    expect(screen.getByRole("option", { name: "Primary" })).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Secondary" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Preschool" }),
    ).toBeInTheDocument();
  });
});
