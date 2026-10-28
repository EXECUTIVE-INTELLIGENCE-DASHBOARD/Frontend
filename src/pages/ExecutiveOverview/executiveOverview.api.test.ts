import { beforeEach, describe, expect, it, vi } from "vitest";

import api from "../../api/axios";
import type { AttendanceRecord } from "../../lib/api/types";
import type { FinanceDashboard } from "../FinanceOverview/financeDashboard.api";
import type { EnrollmentDashboardData } from "../../api/academics.api";
import {
  admissionStages,
  averageAttendance,
  budgetByCampus,
  getExecutiveOverviewData,
  staffingHealth,
} from "./executiveOverview.api";

vi.mock("../../api/axios", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockGet = vi.mocked(api.get);

const attendanceRecords: AttendanceRecord[] = [
  {
    id: 1,
    name: 10,
    student_attendance: "90%",
    grade: "Primary 4",
    staff_attendance: "",
    period: "Term 1",
  },
  {
    id: 2,
    name: 11,
    student_attendance: "Present",
    grade: "Primary 4",
    staff_attendance: "",
    period: "Term 1",
  },
  {
    id: 3,
    name: 12,
    student_attendance: "N/A",
    grade: "Primary 4",
    staff_attendance: "",
    period: "Term 1",
  },
];

const enrollment: EnrollmentDashboardData = {
  term: null,
  summary: {
    total_active_enrolment: 100,
    new_students: 10,
    continuing_students: 90,
    admissions_conversion: 25,
    capacity: 120,
    capacity_utilisation: 83.3,
  },
  gender: {
    boys: 50,
    girls: 50,
    boys_pct: 50,
    girls_pct: 50,
  },
  campuses: [],
  schools: [],
  pipeline: [
    { stage: "applied", label: "Applied", count: 100, rate: 100 },
    { stage: "qualified", label: "Qualified", count: 70, rate: 70 },
    { stage: "accepted", label: "Accepted", count: 40, rate: 40 },
  ],
};

const finance: FinanceDashboard = {
  period: { start: "2026-01-01", end: "2026-10-27" },
  schools: [
    {
      id: 1,
      name: "Kibuli Primary",
      campus: "kibuli",
      revenue: 0,
      liabilities: { owed: 0, due_30_days: 0, overdue: 0 },
      budget: { budget: 100, spent: 60, used_percent: 60 },
      expenses: 0,
      procurement: { spend: 0, not_yet_paid: 0 },
    },
    {
      id: 2,
      name: "Kibuli Secondary",
      campus: "kibuli",
      revenue: 0,
      liabilities: { owed: 0, due_30_days: 0, overdue: 0 },
      budget: { budget: 200, spent: 150, used_percent: 75 },
      expenses: 0,
      procurement: { spend: 0, not_yet_paid: 0 },
    },
  ],
  group: {
    revenue: 0,
    liabilities: { owed: 0, due_30_days: 0, overdue: 0 },
    budget: { budget: 50, spent: 25, used_percent: 50 },
    expenses: 0,
    procurement: { spend: 0, not_yet_paid: 0 },
  },
  totals: {
    revenue: 0,
    liabilities: { owed: 0, due_30_days: 0, overdue: 0 },
    budget: { budget: 350, spent: 235, used_percent: 67.1 },
    expenses: 0,
    procurement: { spend: 0, not_yet_paid: 0 },
  },
};

describe("executive overview data", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it("calculates attendance only from readable live values", () => {
    expect(averageAttendance(attendanceRecords)).toBe(95);
    expect(averageAttendance([])).toBeNull();
  });

  it("calculates staffing health from approved and filled positions", () => {
    expect(
      staffingHealth({
        date: "2026-10-27",
        summary: {
          approved_posts: 20,
          filled_positions: 18,
          vacant_positions: 2,
          vacancy_rate: 10,
          departments_without_approved_posts: 0,
        },
        departments: [],
      }),
    ).toBe(90);
    expect(staffingHealth(null)).toBeNull();
  });

  it("converts cumulative pipeline counts into exclusive live stages", () => {
    expect(admissionStages(enrollment)).toEqual({
      total: 100,
      stages: [
        { id: "applied", label: "Applied", count: 30 },
        { id: "qualified", label: "Qualified", count: 30 },
        { id: "accepted", label: "Accepted", count: 40 },
      ],
    });
  });

  it("uses filtered backend enrollment and finance responses for both charts", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockGet.mockImplementation((url) => {
      if (url === "/academics/enrollment/dashboard/") {
        return Promise.resolve({ data: enrollment });
      }
      if (url === "/finance/dashboard/") {
        return Promise.resolve({ data: finance });
      }

      return Promise.reject(new Error("not available in test"));
    });

    const data = await getExecutiveOverviewData(
      { campus: "Kibuli Main Campus", section: "Secondary" },
      new AbortController().signal,
    );

    expect(mockGet).toHaveBeenCalledWith(
      "/academics/enrollment/dashboard/",
      expect.objectContaining({
        params: { campus: "kibuli", level: "secondary" },
      }),
    );
    expect(admissionStages(data.enrolment)).toEqual({
      total: 100,
      stages: [
        { id: "applied", label: "Applied", count: 30 },
        { id: "qualified", label: "Qualified", count: 30 },
        { id: "accepted", label: "Accepted", count: 40 },
      ],
    });
    expect(budgetByCampus(data.finance, "kibuli")).toEqual([
      { id: "kibuli", label: "Kibuli", spent: 210, budget: 300 },
    ]);
  });

  it("aggregates live budget values by campus and respects campus selection", () => {
    expect(budgetByCampus(finance)).toEqual([
      { id: "kibuli", label: "Kibuli", spent: 210, budget: 300 },
      { id: "group", label: "Group", spent: 25, budget: 50 },
    ]);
    expect(budgetByCampus(finance, "kibuli")).toEqual([
      { id: "kibuli", label: "Kibuli", spent: 210, budget: 300 },
    ]);
  });

  it("requests overview datasets through the shared axios client", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    mockGet.mockRejectedValue(new Error("not available in test"));

    const data = await getExecutiveOverviewData(
      { campus: "Buwaate Campus", section: "Secondary" },
      new AbortController().signal,
    );

    expect(data.errors).toHaveLength(4);
    expect(data.enrolment).toBeNull();
    expect(data.notices).toContain(
      "Attendance records cannot be filtered by campus or section; the attendance metric is hidden for this selection.",
    );
    expect(mockGet).toHaveBeenCalledWith(
      "/academics/enrollment/dashboard/",
      expect.objectContaining({
        params: { campus: "buwaate", level: "secondary" },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(mockGet).toHaveBeenCalledWith(
      "/operations/hr/establishment/",
      expect.objectContaining({
        params: { campus: "buwaate", level: "secondary" },
      }),
    );
    expect(mockGet).toHaveBeenCalledWith(
      "/finance/dashboard/",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(mockGet).not.toHaveBeenCalledWith(
      "/academics/attendance/",
      expect.anything(),
    );
    expect(mockGet).toHaveBeenCalledWith(
      "/operations/incidents/dashboard/",
      expect.objectContaining({
        params: expect.objectContaining({
          campus: "buwaate",
          level: "secondary",
        }),
      }),
    );
  });
});
