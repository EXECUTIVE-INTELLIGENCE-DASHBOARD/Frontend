import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SectionFilter from "./sectionFilters";

describe("SectionFilter", () => {
  it("renders all four academic filters", () => {
    render(<SectionFilter />);

    expect(screen.getByLabelText("Campus")).toBeInTheDocument();
    expect(screen.getByLabelText("Section")).toBeInTheDocument();
    expect(screen.getByLabelText("Term")).toBeInTheDocument();
    expect(screen.getByLabelText("Academic Year")).toBeInTheDocument();
  });

  it("renders the expected default selections", () => {
    render(<SectionFilter />);

    expect(screen.getByLabelText("Campus")).toHaveValue("All Campuses");
    expect(screen.getByLabelText("Section")).toHaveValue("Secondary");
    expect(screen.getByLabelText("Term")).toHaveValue("Term 1");
    expect(screen.getByLabelText("Academic Year")).toHaveValue(
      String(new Date().getFullYear()),
    );
  });

  it("calls onCampusChange when the campus changes", () => {
    const onCampusChange = vi.fn();

    render(<SectionFilter onCampusChange={onCampusChange} />);

    fireEvent.change(screen.getByLabelText("Campus"), {
      target: { value: "Buwaate Campus" },
    });

    expect(onCampusChange).toHaveBeenCalledWith("Buwaate Campus");
  });

  it("resets an unavailable section when the campus changes", () => {
    const onSectionChange = vi.fn();

    render(<SectionFilter onSectionChange={onSectionChange} />);

    fireEvent.change(screen.getByLabelText("Campus"), {
      target: { value: "Annex / Preschool Branch" },
    });

    expect(screen.getByLabelText("Section")).toHaveValue("All Sections");
    expect(onSectionChange).toHaveBeenCalledWith("All Sections");

    expect(
      screen.getByRole("option", { name: "Preschool" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("option", { name: "Secondary" }),
    ).not.toBeInTheDocument();
  });

  it("preserves a section available at the selected campus", () => {
    const onSectionChange = vi.fn();

    render(<SectionFilter onSectionChange={onSectionChange} />);

    fireEvent.change(screen.getByLabelText("Campus"), {
      target: { value: "Kibuli Main Campus" },
    });

    expect(screen.getByLabelText("Section")).toHaveValue("Secondary");
    expect(onSectionChange).toHaveBeenCalledWith("Secondary");
  });

  it("calls onSectionChange when the section changes", () => {
    const onSectionChange = vi.fn();

    render(<SectionFilter onSectionChange={onSectionChange} />);

    fireEvent.change(screen.getByLabelText("Section"), {
      target: { value: "Primary" },
    });

    expect(onSectionChange).toHaveBeenCalledWith("Primary");
  });

  it("calls onTermChange when the term changes", () => {
    const onTermChange = vi.fn();

    render(<SectionFilter onTermChange={onTermChange} />);

    fireEvent.change(screen.getByLabelText("Term"), {
      target: { value: "Term 2" },
    });

    expect(onTermChange).toHaveBeenCalledWith("Term 2");
  });

  it("calls onAcademicYearChange when the year changes", () => {
    const onAcademicYearChange = vi.fn();

    render(<SectionFilter onAcademicYearChange={onAcademicYearChange} />);

    fireEvent.change(screen.getByLabelText("Academic Year"), {
      target: { value: "2025" },
    });

    expect(onAcademicYearChange).toHaveBeenCalledWith("2025");
  });

  it("renders all three term options", () => {
    render(<SectionFilter />);

    expect(
      screen.getByRole("option", { name: "Term 1" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Term 2" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("option", { name: "Term 3" }),
    ).toBeInTheDocument();
  });
});