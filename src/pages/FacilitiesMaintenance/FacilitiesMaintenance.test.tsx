import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FacilitiesMaintenance from "./FacilitiesMaintenance";

describe("FacilitiesMaintenance", () => {
  it("shows Campus, Section and a date range, without Employment, term or year", async () => {
    render(<FacilitiesMaintenance />);
    for (const label of ["Campus", "Section"]) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByLabelText("Start date")).toBeTruthy();
    expect(screen.queryByLabelText("Employment")).toBeNull();
    expect(screen.queryByLabelText("Term")).toBeNull();
    expect(await screen.findByText("Work Orders Logged")).toBeTruthy();
  });

  it("keeps GSL out of the Campus list", async () => {
    render(<FacilitiesMaintenance />);
    await screen.findByText("Work Orders Logged");
    const campus = screen.getByLabelText("Campus") as HTMLSelectElement;
    expect([...campus.options].map((o) => o.value)).not.toContain("GSL");
  });

  it("offers Nursery in the Section filter", async () => {
    render(<FacilitiesMaintenance />);
    await screen.findByText("Work Orders Logged");
    const section = screen.getByLabelText("Section") as HTMLSelectElement;
    expect([...section.options].map((o) => o.value)).toContain("Nursery");
  });

  it("shows the completed, outstanding and overdue cards", async () => {
    render(<FacilitiesMaintenance />);
    await screen.findByText("Work Orders Logged");
    for (const title of ["Completed", "Outstanding", "Overdue"]) {
      expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    }
  });

  it("opens the work orders list and closes it again", async () => {
    render(<FacilitiesMaintenance />);
    fireEvent.click((await screen.findAllByRole("button", { name: /View all/ }))[0]);
    expect(screen.getByRole("dialog", { name: "Work Orders" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("closes the work orders list with Escape", async () => {
    render(<FacilitiesMaintenance />);
    fireEvent.click((await screen.findAllByRole("button", { name: /View all/ }))[0]);
    expect(screen.getByRole("dialog", { name: "Work Orders" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("expands the furniture row to show chairs and desks, and collapses it again", async () => {
    render(<FacilitiesMaintenance />);
    const furniture = await screen.findByRole("button", { name: "Furniture" });
    expect(furniture.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(furniture);
    expect(furniture.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText(/Chairs and desks ·/)).toBeTruthy();
    expect(screen.getByLabelText("Date")).toBeTruthy();
    fireEvent.click(furniture);
    expect(screen.queryByText(/Chairs and desks ·/)).toBeNull();
  });
});