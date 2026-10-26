import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AttendanceAnalysis from "./AttendanceAnalysis";

// The backend has no attendance rows yet, so the page falls back to its sample data.
vi.mock("../../lib/api/academics", () => ({
  academicsApi: { attendance: { list: vi.fn().mockResolvedValue([]) } },
}));

describe("AttendanceAnalysis", () => {
  it("shows the first-tier filters and the KPI cards", async () => {
    render(<AttendanceAnalysis />);
    for (const label of ["Campus", "Section", "Term", "Academic Year"]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(await screen.findByText("Below Target")).toBeTruthy();
  });

  it("switches to Cambridge year groups for GIS", async () => {
    render(<AttendanceAnalysis />);
    await screen.findByText("Below Target");
    fireEvent.change(screen.getByLabelText("Campus"), { target: { value: "Greenhill International (GIS)" } });
    expect(await screen.findAllByText(/Year 10 \(IGCSE\)/)).not.toHaveLength(0);
  });

  it("opens and closes the full table", async () => {
    render(<AttendanceAnalysis />);
    fireEvent.click(await screen.findByRole("button", { name: /View all/ }));
    expect(screen.getByRole("dialog", { name: "Actual vs Target" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("says so when sample data is shown", async () => {
    render(<AttendanceAnalysis />);
    await screen.findByText("Below Target");
    expect(screen.getByRole("status").textContent).toMatch(/sample data/i);
  });
});
