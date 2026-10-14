export type CampusKey = "kibuli" | "buwaate" | "annex";

export interface NationalityRow {
  id: string;
  nationality: string;
  campus: CampusKey;
  /** Learners re-enrolled. */
  reEnrolled: number;
  /** Retention rate in percent. */
  retention: number;
}

export interface RetentionSummary {
  reEnrolled: number;
  /** Re-enrolment rate in percent. */
  rate: number;
  atRisk: number;
  girls: number;
  boys: number;
}
