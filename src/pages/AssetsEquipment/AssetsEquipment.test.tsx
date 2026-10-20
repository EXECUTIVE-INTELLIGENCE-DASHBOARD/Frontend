import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AssetsEquipment } from "./AssetsEquipment";

const chooseCampus = (value: string) =>
  fireEvent.change(screen.getByLabelText("Campus"), { target: { value } });

describe("AssetsEquipment", () => {
  afterEach(() => vi.restoreAllMocks());

  it("shows the three headline cards for all campuses", () => {
    render(<AssetsEquipment />);
    expect(screen.getByText("Total Assets")).toBeTruthy();
    expect(screen.getByText("4,250")).toBeTruthy();
    expect(screen.getByText("88.2%")).toBeTruthy();
    expect(screen.getByText("11.8%")).toBeTruthy();
  });

  it("lists the five asset classes with their condition status", () => {
    render(<AssetsEquipment />);
    expect(screen.getByText("Institutional Asset Register & Condition Summary")).toBeTruthy();
    expect(screen.getByText("Dell Student Laboratory Workstations")).toBeTruthy();
    expect(screen.getByText("67-Seater Student Transport Buses")).toBeTruthy();
    expect(screen.getByText("UGX 680,000,000")).toBeTruthy();
    expect(screen.getByText("Servicing Required")).toBeTruthy();
    expect(screen.getByText("Critical / Repair Queued")).toBeTruthy();
    expect(screen.getAllByText("Operational (Good)")).toHaveLength(3);
  });

  it("changes the figures and rows when a campus is selected", () => {
    render(<AssetsEquipment />);
    chooseCampus("buwaate");
    expect(screen.getByText("880")).toBeTruthy();
    expect(screen.getByText("84.6%")).toBeTruthy();
    expect(screen.getByText("Optics Spectrophotometers & Beakers")).toBeTruthy();
    expect(screen.queryByText("Dell Student Laboratory Workstations")).toBeNull();
  });

  it("downloads the visible rows when Export Report is clicked", () => {
    const createObjectURL = vi.fn(() => "blob:test");
    const revokeObjectURL = vi.fn();
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    render(<AssetsEquipment />);
    fireEvent.click(screen.getByRole("button", { name: /Export Report/i }));

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:test");
  });
});
