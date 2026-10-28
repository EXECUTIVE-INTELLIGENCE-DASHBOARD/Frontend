import { beforeEach, describe, expect, it, vi } from "vitest";
import { academicsApi } from "../../lib/api/academics";
import type { AttendanceRecord } from "../../lib/api/types";
import { getAttendance, recordsToRows } from "./attendance.api";

vi.mock("../../lib/api/academics", () => ({
  academicsApi: { attendance: { list: vi.fn() } },
}));

const rec = (id: number, name: number, grade: string, value: string): AttendanceRecord => ({
  id,
  name,
  grade,
  student_attendance: value,
  staff_attendance: "",
  period: "2026-10-26",
});

const primary5 = [
  rec(1, 1, "Primary 5", "Present"),
  rec(2, 1, "Primary 5", "Present"),
  rec(3, 1, "Primary 5", "Absent"),
  rec(4, 2, "Primary 5", "Present"),
  rec(5, 2, "Primary 5", "Present"),
  rec(6, 2, "Primary 5", "Present"),
];

describe("recordsToRows", () => {
  it("groups student records into one row per class", () => {
    const [row] = recordsToRows(primary5);
    expect(row).toMatchObject({ cls: "Primary 5", learners: 2, days: 3, present: 5, absent: 1, rate: 83.3 });
  });

  it("reads percentages and skips values it cannot read", () => {
    const rows = recordsToRows([rec(1, 1, "Senior 1", "90%"), rec(2, 2, "Senior 1", "n/a"), rec(3, 3, "", "Present")]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ cls: "Senior 1", learners: 1, rate: 90 });
  });
});

describe("getAttendance", () => {
  const list = vi.mocked(academicsApi.attendance.list);
  beforeEach(() => list.mockReset());

  it("builds rows from the backend records", async () => {
    list.mockResolvedValueOnce(primary5 as never);
    const result = await getAttendance();
    expect(result.source).toBe("api");
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].cls).toBe("Primary 5");
  });

  it("returns no rows when the backend has no records", async () => {
    list.mockResolvedValueOnce([] as never);
    expect(await getAttendance()).toEqual({ rows: [], source: "empty" });
  });

  it("returns no rows when the server cannot be reached", async () => {
    list.mockRejectedValueOnce(new Error("network"));
    expect(await getAttendance()).toEqual({ rows: [], source: "offline" });
  });
});