import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HrWorkforce } from "./HrWorkforce";

const openTab = (name: string) => fireEvent.click(screen.getByRole("tab", { name }));
const chooseEmployer = (value: string) =>
  fireEvent.change(screen.getByLabelText("Employer"), { target: { value } });

describe("HrWorkforce tabs", () => {
  afterEach(() => vi.restoreAllMocks());

  it("opens on the Workforce tab with the three tabs available", () => {
    render(<HrWorkforce />);

    expect(screen.getByRole("tab", { name: "Workforce" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Establishment" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Talent" })).toBeTruthy();
    expect(screen.getByRole("cell", { name: "Academic & Curriculum Instruction" })).toBeTruthy();
    expect(screen.queryByText("GSL Head Office")).toBeNull();
  });

  it("shows the GSL units on the Workforce tab for the GSL employer", () => {
    render(<HrWorkforce />);
    chooseEmployer("gsl");

    expect(screen.getByText("GSL Head Office")).toBeTruthy();
    expect(screen.getByText("Café")).toBeTruthy();
    expect(screen.queryByText("Academic & Curriculum Instruction")).toBeNull();
  });

  it("shows both registers for all employment", () => {
    render(<HrWorkforce />);
    chooseEmployer("all");

    expect(screen.getByRole("cell", { name: "Academic & Curriculum Instruction" })).toBeTruthy();
    expect(screen.getByText("GSL Head Office")).toBeTruthy();
  });

  it("shows approved, filled and vacant posts on the Establishment tab", () => {
    render(<HrWorkforce />);
    openTab("Establishment");

    expect(screen.getByText("Approved vs Filled Positions")).toBeTruthy();
    expect(screen.getByText("188")).toBeTruthy();
    expect(screen.getByText("169")).toBeTruthy();
    expect(screen.getByText("Teaching – Sciences")).toBeTruthy();
    expect(screen.queryByText("Minimart")).toBeNull();

    chooseEmployer("gsl");
    expect(screen.getByText("Minimart")).toBeTruthy();
    expect(screen.queryByText("Teaching – Sciences")).toBeNull();
  });

  it("switches between exits, contracts and ratings on the Talent tab", () => {
    render(<HrWorkforce />);
    openTab("Talent");

    expect(screen.getByText("Staff Exits & Turnover")).toBeTruthy();
    expect(screen.getByText("Mr. John Mubiru")).toBeTruthy();
    expect(screen.queryByText("Ms. Brenda Nakirya")).toBeNull();

    openTab("Contracts");
    expect(screen.getByText("Senior Contract End Dates & Renewals")).toBeTruthy();
    expect(screen.getByText("Dr. Peter Ssemakula")).toBeTruthy();

    openTab("Ratings");
    expect(screen.getByText("Performance Ratings – Board-Appointed Senior Staff")).toBeTruthy();
    expect(screen.getByText("Needs improvement")).toBeTruthy();
  });

  it("includes GSL staff in the Talent tab when all employment is chosen", () => {
    render(<HrWorkforce />);
    openTab("Talent");
    chooseEmployer("all");

    expect(screen.getByText("Ms. Brenda Nakirya")).toBeTruthy();
  });

  it("downloads the visible rows when Export Report is clicked", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<HrWorkforce />);
    openTab("Establishment");
    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
