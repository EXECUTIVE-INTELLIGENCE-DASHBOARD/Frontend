import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FacilitiesMaintenance from "./FacilitiesMaintenance";

describe("FacilitiesMaintenance", () => {
  it("shows Employment, Campus, Section and a date range, without term or year", async () => {
    render(<FacilitiesMaintenance />);
    for (const label of ["Employment", "Campus", "Section"]) expect(screen.getByLabelText(label)).toBeTruthy();
    expect(screen.getByLabelText("Start date")).toBeTruthy();
    expect(screen.queryByLabelText("Term")).toBeNull();
    expect(await screen.findByText("Work Orders Logged")).toBeTruthy();
  });

  it("keeps GSL out of the Campus list and disables Campus when GSL is selected", async () => {
    render(<FacilitiesMaintenance />);
    await screen.findByText("Work Orders Logged");
    const campus = screen.getByLabelText("Campus") as HTMLSelectElement;
    expect([...campus.options].map((o) => o.value)).not.toContain("GSL");
    fireEvent.change(screen.getByLabelText("Employment"), { target: { value: "GSL" } });
    expect((screen.getByLabelText("Campus") as HTMLSelectElement).disabled).toBe(true);
  });

  it("offers Nursery in the Section filter", async () => {
    render(<FacilitiesMaintenance />);
    await screen.findByText("Work Orders Logged");
    const section = screen.getByLabelText("Section") as HTMLSelectElement;
    expect([...section.options].map((o) => o.value)).toContain("Nursery");
  });

  it("opens the work orders list and closes it again", async () => {
    render(<FacilitiesMaintenance />);
    fireEvent.click((await screen.findAllByRole("button", { name: /View all/ }))[0]);
    expect(screen.getByRole("dialog", { name: "Work Orders" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
