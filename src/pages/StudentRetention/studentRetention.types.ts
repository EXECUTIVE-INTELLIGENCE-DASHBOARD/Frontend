export type CampusKey = "kibuli" | "buwaate" | "annex";

/**
 * A nationality row as the table renders it.
 *
 * Everything the API can leave out is nullable: `null` is drawn as an em dash so
 * a missing figure is never mistaken for a real zero.
 */
export interface NationalityRow {
  id: string;
  nationality: string;
  campus: CampusKey;
  /** Learners re-enrolled, or `null` when the API omitted it. */
  reEnrolled: number | null;
  /** Retention rate in percent, or `null` when there were no eligible learners. */
  retention: number | null;
}

export interface RetentionSummary {
  reEnrolled: number | null;
  /** Re-enrolment rate in percent, `null` when it cannot be derived. */
  rate: number | null;
  atRisk: number | null;
}

