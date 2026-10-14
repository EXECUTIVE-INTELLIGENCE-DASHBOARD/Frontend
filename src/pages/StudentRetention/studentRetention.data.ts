import type {
  CampusKey,
  NationalityRow,
  RetentionSummary,
} from "./studentRetention.types";

export const allCampusesLabel = "All Campuses";

export const campuses: Array<{ key: CampusKey; label: string; short: string }> =
  [
    { key: "kibuli", label: "Kibuli Main Campus", short: "Kibuli" },
    { key: "buwaate", label: "Buwaate Campus", short: "Buwaate" },
    { key: "annex", label: "Annex / Preschool Branch", short: "Annex" },
  ];

/** Rows at or above this retention rate are highlighted in blue. */
export const retentionTarget = 88;

/* Rows come from the design reference. */
export const nationalities: NationalityRow[] = [
  { id: "ugandan", nationality: "Ugandan", campus: "kibuli", reEnrolled: 1100, retention: 88.0 },
  { id: "kenyan", nationality: "Kenyan", campus: "buwaate", reEnrolled: 390, retention: 86.7 },
  { id: "rwandese", nationality: "Rwandese", campus: "buwaate", reEnrolled: 220, retention: 88.0 },
  { id: "south-sudanese", nationality: "South Sudanese & Other Intl", campus: "buwaate", reEnrolled: 90, retention: 90.0 },
];

/*
 * Sample figures per campus. The three campuses add up to the
 * "All Campuses" figures in the design reference: 1,200 re-enrolled
 * (720 girls and 480 boys) and 150 at risk.
 */
const summaryByCampus: Record<CampusKey, RetentionSummary> = {
  kibuli: { reEnrolled: 600, rate: 89.2, atRisk: 75, girls: 360, boys: 240 },
  buwaate: { reEnrolled: 450, rate: 87.6, atRisk: 60, girls: 270, boys: 180 },
  annex: { reEnrolled: 150, rate: 88.0, atRisk: 15, girls: 90, boys: 60 },
};

const allCampusesRate = 88.5;

const campusFor = (label: string) =>
  campuses.find((campus) => campus.label === label);

export const campusShortName = (key: CampusKey) =>
  campuses.find((campus) => campus.key === key)?.short ?? key;

export const formatNumber = (value: number) => value.toLocaleString("en-US");

/** The nationality rows for a campus. "All Campuses" shows every row. */
export function rowsForCampus(label: string): NationalityRow[] {
  const campus = campusFor(label);

  return campus
    ? nationalities.filter((row) => row.campus === campus.key)
    : nationalities;
}

/** The headline figures for a campus. "All Campuses" adds the campuses up. */
export function summaryForCampus(label: string): RetentionSummary {
  const campus = campusFor(label);

  if (campus) {
    return summaryByCampus[campus.key];
  }

  const total = Object.values(summaryByCampus).reduce<RetentionSummary>(
    (sum, item) => ({
      reEnrolled: sum.reEnrolled + item.reEnrolled,
      rate: allCampusesRate,
      atRisk: sum.atRisk + item.atRisk,
      girls: sum.girls + item.girls,
      boys: sum.boys + item.boys,
    }),
    { reEnrolled: 0, rate: allCampusesRate, atRisk: 0, girls: 0, boys: 0 },
  );

  return total;
}
