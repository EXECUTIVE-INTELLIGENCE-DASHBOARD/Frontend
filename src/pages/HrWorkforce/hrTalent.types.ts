export type Employer = "schools" | "gsl";
export type EmployerFilter = "all" | Employer;
export type ExitType = "Voluntary" | "Involuntary" | "Contract end" | "Retirement";
export type RenewalStatus =
  | "Not yet due"
  | "Renewal recommended"
  | "Pending board decision"
  | "Under review";

/** A GSL unit (head office, shop, café or minimart) in the workforce register. */
export interface GslUnit {
  id: string;
  name: string;
  category: string;
  headcount: number;
  /** Attendance rate in percent. */
  attendanceRate: number;
  absent: number;
}

export interface EstablishmentRow {
  id: string;
  name: string;
  location: string;
  approved: number;
  filled: number;
  employer: Employer;
}

export interface ExitRecord {
  id: string;
  name: string;
  role: string;
  unit: string;
  /** ISO date, e.g. "2026-09-30". */
  date: string;
  reason: string;
  type: ExitType;
  employer: Employer;
}

export interface SeniorStaff {
  id: string;
  name: string;
  position: string;
  /** ISO date of the contract end. */
  contractEnd: string;
  /** Performance rating out of 5. */
  rating: number;
  lastReview: string;
  renewal: RenewalStatus;
  employer: Employer;
}
