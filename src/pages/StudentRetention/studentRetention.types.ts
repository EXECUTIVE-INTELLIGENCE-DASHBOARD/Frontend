export type CampusKey = "kibuli" | "buwaate" | "annex";

export interface RetentionSummary {
  reEnrolled: number | null;
  /** Re-enrolment rate in percent, `null` when it cannot be derived. */
  rate: number | null;
  atRisk: number | null;
}
