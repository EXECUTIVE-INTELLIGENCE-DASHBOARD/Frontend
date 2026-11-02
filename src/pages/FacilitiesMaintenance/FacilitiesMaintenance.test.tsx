import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FacilitiesMaintenance from "./FacilitiesMaintenance";

const loaded = () => screen.findByText("Work Orders Logged");

const logged = () =>
  Number(
    screen.getByText("Work Orders Logged").parentElement?.querySelector("strong")?.textContent?.replace(/,/g, "")
  );

describe("FacilitiesMaintenance", () => {
  it("shows Campus, Section and a date range, without Employment, term or year", async () => {
    render(<FacilitiesMaintenance />);
    for (const label of ["Campus", "Section"]) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByLabelText("Start date")).toBeTruthy();
    expect(screen.queryByLabelText("Employment")).toBeNull();
    expect(screen.queryByLabelText("Term")).toBeNull();
    expect(await loaded()).toBeTruthy();
  });

  it("keeps GSL out of the Campus list", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    const campus = screen.getByLabelText("Campus") as HTMLSelectElement;
    expect([...campus.options].map((o) => o.value)).not.toContain("GSL");
  });

  it("offers Nursery in the Section filter", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    const section = screen.getByLabelText("Section") as HTMLSelectElement;
    expect([...section.options].map((o) => o.value)).toContain("Nursery");
  });

  it("shows the logged, completed, outstanding and overdue KPI cards", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    for (const label of ["Completed", "Outstanding", "Overdue"]) {
      expect(screen.getAllByText(label).length).toBeGreaterThan(0);
    }
  });

  it("shows the four work order graphs", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    for (const name of [
      "Status share",
      "Work orders by category",
      "Logged vs completed by month",
      "Completion rate by category",
    ]) {
      expect(screen.getByRole("heading", { name })).toBeTruthy();
    }
    expect(screen.getByRole("img", { name: /Status share of \d+ work orders/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Work orders by category/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /logged and completed each month/ })).toBeTruthy();
    expect(screen.getByRole("img", { name: /Completion rate by category/ })).toBeTruthy();
  });

  it("labels the x and y axes of the graphs", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    expect(screen.getAllByText("Category").length).toBe(2);
    expect(screen.getAllByText("Work orders").length).toBe(2);
    expect(screen.getByText("Completion rate (%)")).toBeTruthy();
    expect(screen.getByText(/Month logged/)).toBeTruthy();
  });

  it("has no tables, lists or View all popups", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button", { name: /View all/ })).toBeNull();
  });

  it("narrows the work orders when a location is chosen", async () => {
    render(<FacilitiesMaintenance />);
    await loaded();
    const before = logged();
    const location = screen.getByLabelText("Location") as HTMLSelectElement;
    const pick = [...location.options].find((o) => o.value !== "");
    fireEvent.change(location, { target: { value: pick?.value } });
    expect(logged()).toBeLessThan(before);
  });
});
