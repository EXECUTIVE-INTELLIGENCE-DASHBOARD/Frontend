export type CampusKey = "kibuli" | "buwaate" | "annex";

export type TierId = "nursery" | "primary" | "olevel" | "alevel";

export interface CampusRow {
  key: CampusKey;
  /** Short name used under the chart bars. */
  label: string;
  boys: number;
  girls: number;
  total: number;
}

export interface TierRow {
  id: TierId;
  label: string;
  value: number;
  /** Share of the selected enrolment, in percent. */
  share: number;
}

export interface EnrollmentSummary {
  total: number;
  boys: number;
  girls: number;
  /** Admissions conversion, in percent. */
  conversion: number;
  /** Capacity utilisation, in percent. */
  capacity: number;
}
