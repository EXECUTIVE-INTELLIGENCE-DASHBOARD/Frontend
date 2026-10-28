import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { academicsApi } from "../../lib/api/academics";
import type { AttendanceRecord } from "../../lib/api/types";
import AttendanceAnalysis from "./AttendanceAnalysis";

vi.mock("../../lib/api/academics", () => ({
  academicsApi: { attendance: { list: vi.fn() } },
}));

const list = vi.mocked(academicsApi.attendance.list);

const CLASSES = ["Primary 5", "Primary 6", "Primary 7", "Senior 1", "Senior 2", "Senior 3", "Senior 4"];

/** Two students per class, three school days each; the first class has some absences. */
const records: AttendanceRecord[] = CLASSES.flatMap((grade, c) =>
  [1, 2].flatMap((s) =>
    ["Present", "Present", c === 0 ? "Absent" : "Present"].map((value, d) => ({
      id: c * 100 + s * 10 + d,
      name: c * 10 + s,
      grade,
      student_attendance: value,
      staff_attendance: "",
      period: "2026-10-26",
    })),
  ),
);

describe("AttendanceAnalysis", () => {
  beforeEach(() => {
    list.mockReset();
    list.mockResolvedValue(records as never);
  });

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

  it("falls back to sample data when the backend has no records", async () => {
    list.mockResolvedValue([] as never);
    render(<AttendanceAnalysis />);
    expect(await screen.findByText("Below Target")).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
