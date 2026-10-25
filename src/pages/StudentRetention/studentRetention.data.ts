
import type {
  CampusKey,
  NationalityRow,
  RetentionSummary,
} from "./studentRetention.types";
import type { RetentionDashboardData } from "./studentRetention.api";

export const allCampusesLabel = "All Campuses";

export const campuses: Array<{
  key: CampusKey;
  label: string;
  short: string;
}> = [
  { key: "kibuli", label: "Kibuli Main Campus", short: "Kibuli" },
  { key: "buwaate", label: "Buwaate Campus", short: "Buwaate" },
  { key: "annex", label: "Annex / Preschool Branch", short: "Annex" },
];

export const retentionTarget = 88;

export const campusShortName = (key: CampusKey) =>
  campuses.find((campus) => campus.key === key)?.short ?? key;

export const formatNumber = (value: number) =>
  value.toLocaleString("en-US");

/**
 * The placeholder for anything the backend does not report.
 *
 * A zero and an absent figure are different facts, so an absent one is drawn as
 * an em dash rather than `0` — that way the screen itself says which numbers are
 * live and which still need wiring.
 */
export const dash = "—";

export const formatMetric = (value: number | null | undefined) =>
  value === null || value === undefined ? dash : formatNumber(value);

export const formatRate = (value: number | null | undefined) =>
  value === null || value === undefined ? dash : `${value.toFixed(1)}%`;

function getCampusKey(value: string, display: string): CampusKey {
  const text = `${value} ${display}`.toLowerCase();

  if (text.includes("buwaate")) return "buwaate";
  if (text.includes("annex") || text.includes("preschool")) return "annex";
  return "kibuli";
}

function matchesCampus(
  row: RetentionDashboardData["by_nationality"][number],
  selectedCampus: CampusKey,
): boolean {
  return getCampusKey(row.campus, row.campus_display) === selectedCampus;
}

export function rowsForCampus(
  data: RetentionDashboardData,
  label: string,
): NationalityRow[] {
  const selectedCampus = campuses.find(
    (campus) => campus.label === label,
  );

  return data.by_nationality
    .filter(
      (row) =>
        !selectedCampus ||
        matchesCampus(row, selectedCampus.key),
    )
    .map((row, index) => ({
      id: `${row.nationality}-${row.campus}-${index}`,
      nationality: row.nationality,
      campus: getCampusKey(row.campus, row.campus_display),
      reEnrolled: row.re_enrolled ?? null,
      retention: row.retention_rate ?? null,
    }));
}

export function summaryForCampus(
  data: RetentionDashboardData,
  label: string,
): RetentionSummary {
  const selectedCampus = campuses.find(
    (campus) => campus.label === label,
  );

  const rows = data.by_nationality.filter(
    (row) =>
      !selectedCampus ||
      matchesCampus(row, selectedCampus.key),
  );

  /* No rows for the chosen campus means "unknown", not "zero enrolled". */
  const reEnrolled = selectedCampus
    ? rows.length === 0
      ? null
      : rows.reduce((total, row) => total + (row.re_enrolled ?? 0), 0)
    : (data.summary?.total_re_enrolled ?? null);

  const eligible = selectedCampus
    ? rows.length === 0
      ? null
      : rows.reduce((total, row) => total + (row.eligible ?? 0), 0)
    : (data.summary?.eligible_to_return ?? null);

  const reportedRate = selectedCampus
    ? null
    : (data.summary?.re_enrolment_rate ?? null);

  return {
    reEnrolled,
    rate:
      reportedRate ??
      (reEnrolled !== null && eligible
        ? Math.round((reEnrolled / eligible) * 1000) / 10
        : null),
    atRisk: data.summary?.at_risk ?? null,
  };
}
