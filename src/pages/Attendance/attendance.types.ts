export type Section = "" | "Primary" | "Secondary";

export interface AttendanceFilters {
  campus: string;
  section: Section;
  term: number;
  year: string;
}

export interface AttendanceRow {
  cls: string;
  stream: string;
  learners: number;
  days: number;
  present: number;
  absent: number;
  /** Attendance rate, 0-100 */
  rate: number;
  /** Agreed target for this class, 0-100 */
  target: number;
  /** Stable seed so sample data does not jump between renders */
  seed: number;
}

export interface Totals {
  learners: number;
  present: number;
  absent: number;
  rate: number;
  below: number;
}

export interface ClassGroup {
  cls: string;
  rate: number;
  target: number;
}

export interface ResultsPoint {
  week: number;
  attendance: number;
  /** null = no assessment recorded that week */
  score: number | null;
}
