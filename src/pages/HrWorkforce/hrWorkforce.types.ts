export type CampusKey = "kibuli" | "buwaate" | "annex";

export type DepartmentIcon = "book" | "utensils" | "bus" | "briefcase" | "wrench";

export type AbsenceKind = "Leave" | "Training" | "Leave/Field";

export type AbsenceTone = "neutral" | "info" | "warn";

/** What stays the same for a department on every campus. */
export interface Department {
  id: string;
  name: string;
  icon: DepartmentIcon;
  /** Nature / staff category, e.g. "Non-Teaching Support". */
  category: string;
  teaching: boolean;
  location: string;
  /** Attendance rate in percent. */
  attendanceRate: number;
  absenceKind: AbsenceKind;
  absenceTone: AbsenceTone;
}

/** Headcount and absences for one department on one campus. */
export interface DepartmentFigures {
  headcount: number;
  absent: number;
}

/** One table row: a department with its figures for the selected campus. */
export interface DepartmentRow extends Department, DepartmentFigures {}

export interface WorkforceSummary {
  totalStaff: number;
  /** Teaching to non-teaching staff, e.g. "1:1.4". */
  ratio: string;
  /** Workforce attendance in percent. */
  attendance: number;
}
